"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSinglePdfFile } from "@/hooks/use-single-pdf-file";
import { openPdfForRendering, renderPageThumbnail, PdfRenderError } from "@/lib/pdf/render-page";
import { buildOrganizedPdf, PdfOrganizeError, type OrganizePageOp } from "@/lib/pdf/organize-pdf";
import { generateId, buildOutputFilename, stripPdfExtension } from "@/lib/file-utils";
import { DEFAULT_OUTPUT_FILENAME } from "@/lib/constants";
import type { OrganizePageItem, PdfBuildResult } from "@/types/pdf";

function normalizeRotation(deg: number): OrganizePageItem["rotation"] {
  const normalized = ((deg % 360) + 360) % 360;
  return normalized as OrganizePageItem["rotation"];
}

export function useOrganizePdf() {
  const { file: sourceFile, setSourceFile, clearFile } = useSinglePdfFile();
  const [pages, setPages] = useState<OrganizePageItem[]>([]);
  const [outputFilename, setOutputFilename] = useState(DEFAULT_OUTPUT_FILENAME);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<PdfBuildResult | null>(null);
  const resultRef = useRef<PdfBuildResult | null>(null);
  const renderedForFileId = useRef<string | null>(null);
  const filenameTouched = useRef(false);

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
      renderedForFileId.current = null;
      filenameTouched.current = false;
      setPages([]);
      setSourceFile(incoming);
    },
    [clearResult, setSourceFile]
  );

  const updateOutputFilename = useCallback((name: string) => {
    filenameTouched.current = true;
    setOutputFilename(name);
  }, []);

  // Render page thumbnails once the source file's page count is known.
  useEffect(() => {
    if (!sourceFile || sourceFile.status !== "ready") return;
    if (renderedForFileId.current === sourceFile.id) return;
    renderedForFileId.current = sourceFile.id;

    if (!filenameTouched.current) {
      setOutputFilename(stripPdfExtension(sourceFile.name));
    }

    let cancelled = false;
    setIsRenderingThumbnails(true);

    const initialPages: OrganizePageItem[] = Array.from(
      { length: sourceFile.pageCount },
      (_, i) => ({
        id: generateId(),
        sourceIndex: i,
        rotation: 0,
        thumbnailUrl: null,
      })
    );
    setPages(initialPages);

    (async () => {
      let session: Awaited<ReturnType<typeof openPdfForRendering>> | null = null;
      try {
        session = await openPdfForRendering(sourceFile.file);
        for (let i = 0; i < initialPages.length; i += 1) {
          if (cancelled) break;
          const dataUrl = await renderPageThumbnail(session.pdf, i + 1);
          if (cancelled) break;
          const pageId = initialPages[i].id;
          setPages((current) =>
            current.map((page) => (page.id === pageId ? { ...page, thumbnailUrl: dataUrl } : page))
          );
        }
      } catch (error) {
        const message =
          error instanceof PdfRenderError
            ? error.message
            : "Could not render page previews for this PDF.";
        toast.error(message);
      } finally {
        if (session) await session.destroy();
        if (!cancelled) setIsRenderingThumbnails(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceFile]);

  const reorderPages = useCallback((newOrder: OrganizePageItem[]) => {
    setPages(newOrder);
  }, []);

  const rotatePageBy = useCallback((id: string, delta: number) => {
    setPages((current) =>
      current.map((page) =>
        page.id === id ? { ...page, rotation: normalizeRotation(page.rotation + delta) } : page
      )
    );
  }, []);

  const rotateLeft = useCallback((id: string) => rotatePageBy(id, -90), [rotatePageBy]);
  const rotateRight = useCallback((id: string) => rotatePageBy(id, 90), [rotatePageBy]);

  const deletePage = useCallback((id: string) => {
    setPages((current) => (current.length <= 1 ? current : current.filter((page) => page.id !== id)));
  }, []);

  const organize = useCallback(async () => {
    if (!sourceFile || sourceFile.status !== "ready" || pages.length === 0) {
      toast.error("Upload a PDF to organize first.");
      return;
    }

    setIsSaving(true);
    clearResult();

    try {
      const pageOps: OrganizePageOp[] = pages.map((page) => ({
        sourceIndex: page.sourceIndex,
        rotationDelta: page.rotation,
      }));
      const built = await buildOrganizedPdf(sourceFile.file, pageOps);
      resultRef.current = built;
      setResult(built);
    } catch (error) {
      const message =
        error instanceof PdfOrganizeError
          ? error.message
          : "Something went wrong while saving your PDF. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [sourceFile, pages, clearResult]);

  const reset = useCallback(() => {
    clearResult();
    clearFile();
    setPages([]);
    setOutputFilename(DEFAULT_OUTPUT_FILENAME);
    renderedForFileId.current = null;
    filenameTouched.current = false;
    setIsSaving(false);
    setIsRenderingThumbnails(false);
  }, [clearResult, clearFile]);

  const canOrganize =
    !!sourceFile &&
    sourceFile.status === "ready" &&
    pages.length > 0 &&
    !isRenderingThumbnails &&
    !isSaving;

  return {
    sourceFile,
    addFile,
    pages,
    reorderPages,
    rotateLeft,
    rotateRight,
    deletePage,
    outputFilename,
    setOutputFilename: updateOutputFilename,
    isRenderingThumbnails,
    isSaving,
    result,
    organize,
    reset,
    canOrganize,
    buildOutputFilename: () => buildOutputFilename(outputFilename),
  };
}
