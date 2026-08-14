"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSinglePdfFile } from "@/hooks/use-single-pdf-file";
import { openPdfForRendering, renderPageThumbnail, PdfRenderError } from "@/lib/pdf/render-page";
import {
  signPdf,
  toSignaturePlacement,
  PdfSignError,
  type CenterPlacement,
} from "@/lib/pdf/sign-pdf";
import { buildOutputFilename, stripPdfExtension } from "@/lib/file-utils";
import { DEFAULT_SIGN_FILENAME } from "@/lib/constants";
import type { PdfBuildResult } from "@/types/pdf";

const PREVIEW_WIDTH = 480;
const DEFAULT_WIDTH_RATIO = 0.28;

export function useSignPdf() {
  const { file: sourceFile, setSourceFile, clearFile } = useSinglePdfFile();
  const [outputFilename, setOutputFilenameState] = useState(DEFAULT_SIGN_FILENAME);
  const filenameTouched = useRef(false);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageImageUrl, setPageImageUrl] = useState<string | null>(null);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);
  const renderedForKey = useRef<string | null>(null);

  const [signatureBlob, setSignatureBlobState] = useState<Blob | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureAspectRatio, setSignatureAspectRatio] = useState<number | null>(null);
  const [placement, setPlacement] = useState<CenterPlacement | null>(null);

  const [isSigning, setIsSigning] = useState(false);
  const [result, setResult] = useState<PdfBuildResult | null>(null);
  const resultRef = useRef<PdfBuildResult | null>(null);

  const clearResult = useCallback(() => {
    if (resultRef.current) {
      URL.revokeObjectURL(resultRef.current.url);
      resultRef.current = null;
    }
    setResult(null);
  }, []);

  const addFile = useCallback(
    (incoming: FileList | File[]) => {
      clearResult();
      filenameTouched.current = false;
      renderedForKey.current = null;
      setCurrentPageIndex(0);
      setPageImageUrl(null);
      setPageAspectRatio(null);
      setSignatureBlobState(null);
      setPlacement(null);
      setSourceFile(incoming);
    },
    [clearResult, setSourceFile]
  );

  const setOutputFilename = useCallback((name: string) => {
    filenameTouched.current = true;
    setOutputFilenameState(name);
  }, []);

  // Render the currently selected page as a preview whenever the file or page index changes.
  useEffect(() => {
    if (!sourceFile || sourceFile.status !== "ready") return;
    const key = `${sourceFile.id}:${currentPageIndex}`;
    if (renderedForKey.current === key) return;
    renderedForKey.current = key;

    if (!filenameTouched.current) {
      setOutputFilenameState(stripPdfExtension(sourceFile.name));
    }

    let cancelled = false;
    setIsRenderingPage(true);
    setPageAspectRatio(null);

    (async () => {
      let session: Awaited<ReturnType<typeof openPdfForRendering>> | null = null;
      try {
        session = await openPdfForRendering(sourceFile.file);
        const dataUrl = await renderPageThumbnail(session.pdf, currentPageIndex + 1, PREVIEW_WIDTH);
        if (!cancelled) setPageImageUrl(dataUrl);
      } catch (error) {
        const message =
          error instanceof PdfRenderError
            ? error.message
            : "Could not render a preview of this page.";
        toast.error(message);
      } finally {
        if (session) await session.destroy();
        if (!cancelled) setIsRenderingPage(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceFile, currentPageIndex]);

  const goToPage = useCallback(
    (index: number) => {
      if (!sourceFile) return;
      const clamped = Math.min(Math.max(index, 0), sourceFile.pageCount - 1);
      setCurrentPageIndex(clamped);
      setPlacement(null);
    },
    [sourceFile]
  );

  const setSignatureBlob = useCallback(async (blob: Blob | null) => {
    setSignatureUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return blob ? URL.createObjectURL(blob) : null;
    });
    setSignatureBlobState(blob);
    setPlacement(null);

    if (!blob) {
      setSignatureAspectRatio(null);
      return;
    }
    try {
      const bitmap = await createImageBitmap(blob);
      setSignatureAspectRatio(bitmap.height / bitmap.width);
      bitmap.close();
    } catch {
      setSignatureAspectRatio(null);
    }
  }, []);

  const placeSignature = useCallback((xRatioCenter: number, yRatioCenterFromTop: number) => {
    setPlacement((current) => ({
      xRatioCenter,
      yRatioCenterFromTop,
      widthRatio: current?.widthRatio ?? DEFAULT_WIDTH_RATIO,
    }));
  }, []);

  const setSignatureWidthRatio = useCallback((widthRatio: number) => {
    setPlacement((current) => (current ? { ...current, widthRatio } : current));
  }, []);

  const sign = useCallback(async () => {
    if (!sourceFile || sourceFile.status !== "ready") {
      toast.error("Upload a PDF first.");
      return;
    }
    if (!signatureBlob || !placement || pageAspectRatio === null || signatureAspectRatio === null) {
      toast.error("Add a signature and click the page to place it first.");
      return;
    }

    setIsSigning(true);
    clearResult();

    try {
      const signatureBytes = new Uint8Array(await signatureBlob.arrayBuffer());
      const signaturePlacement = toSignaturePlacement(
        currentPageIndex,
        placement,
        pageAspectRatio,
        signatureAspectRatio
      );
      const built = await signPdf(sourceFile.file, signatureBytes, signaturePlacement);
      resultRef.current = built;
      setResult(built);
    } catch (error) {
      const message =
        error instanceof PdfSignError
          ? error.message
          : "Something went wrong while signing your PDF. Please try again.";
      toast.error(message);
    } finally {
      setIsSigning(false);
    }
  }, [sourceFile, signatureBlob, placement, pageAspectRatio, signatureAspectRatio, currentPageIndex, clearResult]);

  const reset = useCallback(() => {
    clearResult();
    clearFile();
    setOutputFilenameState(DEFAULT_SIGN_FILENAME);
    filenameTouched.current = false;
    renderedForKey.current = null;
    setCurrentPageIndex(0);
    setPageImageUrl(null);
    setPageAspectRatio(null);
    setSignatureUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setSignatureBlobState(null);
    setSignatureAspectRatio(null);
    setPlacement(null);
    setIsSigning(false);
  }, [clearResult, clearFile]);

  const canSign =
    !!sourceFile &&
    sourceFile.status === "ready" &&
    !!signatureBlob &&
    !!placement &&
    !isSigning;

  return {
    sourceFile,
    addFile,
    currentPageIndex,
    goToPage,
    pageImageUrl,
    isRenderingPage,
    setPageAspectRatio,
    signatureUrl,
    setSignatureBlob,
    placement,
    placeSignature,
    setSignatureWidthRatio,
    outputFilename,
    setOutputFilename,
    isSigning,
    result,
    sign,
    reset,
    canSign,
    buildOutputFilename: () => buildOutputFilename(outputFilename),
  };
}
