"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSinglePdfFile } from "@/hooks/use-single-pdf-file";
import { openPdfForRendering, renderPageThumbnail, PdfRenderError } from "@/lib/pdf/render-page";
import { convertPdfToImages } from "@/lib/pdf/pdf-to-images";
import { buildZip } from "@/lib/zip-utils";
import { generateId, sanitizeFilename, stripPdfExtension } from "@/lib/file-utils";
import { DEFAULT_CONVERT_FILENAME } from "@/lib/constants";
import type { SelectablePageItem, MultiFileResult } from "@/types/pdf";

export type ImageFormat = "png" | "jpeg";

export function usePdfToImages() {
  const { file: sourceFile, setSourceFile, clearFile } = useSinglePdfFile();
  const [pages, setPages] = useState<SelectablePageItem[]>([]);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [outputFilename, setOutputFilenameState] = useState(DEFAULT_CONVERT_FILENAME);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<MultiFileResult | null>(null);
  const resultRef = useRef<MultiFileResult | null>(null);
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

  const setOutputFilename = useCallback((name: string) => {
    filenameTouched.current = true;
    setOutputFilenameState(name);
  }, []);

  // Render page thumbnails once the source file's page count is known. All
  // pages start selected — converting the whole document is the common case.
  useEffect(() => {
    if (!sourceFile || sourceFile.status !== "ready") return;
    if (renderedForFileId.current === sourceFile.id) return;
    renderedForFileId.current = sourceFile.id;

    if (!filenameTouched.current) {
      setOutputFilenameState(stripPdfExtension(sourceFile.name));
    }

    let cancelled = false;
    setIsRenderingThumbnails(true);

    const initialPages: SelectablePageItem[] = Array.from(
      { length: sourceFile.pageCount },
      (_, i) => ({ id: generateId(), sourceIndex: i, selected: true, thumbnailUrl: null })
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

  const togglePage = useCallback((id: string) => {
    setPages((current) =>
      current.map((page) => (page.id === id ? { ...page, selected: !page.selected } : page))
    );
  }, []);

  const selectAll = useCallback(() => {
    setPages((current) => current.map((page) => ({ ...page, selected: true })));
  }, []);

  const selectNone = useCallback(() => {
    setPages((current) => current.map((page) => ({ ...page, selected: false })));
  }, []);

  const selectedCount = pages.filter((page) => page.selected).length;

  const convert = useCallback(async () => {
    const selected = pages.filter((page) => page.selected);
    if (!sourceFile || sourceFile.status !== "ready" || selected.length === 0) {
      toast.error("Select at least one page to convert.");
      return;
    }

    setIsConverting(true);
    clearResult();

    try {
      const pageNumbers = selected.map((page) => page.sourceIndex + 1);
      const outputs = await convertPdfToImages(sourceFile.file, pageNumbers, format);

      let built: MultiFileResult;
      if (outputs.length === 1) {
        const only = outputs[0];
        built = {
          blob: only.blob,
          url: URL.createObjectURL(only.blob),
          size: only.blob.size,
          fileCount: 1,
          isZip: false,
        };
      } else {
        const entries = await Promise.all(
          outputs.map(async (output) => ({
            name: output.name,
            bytes: new Uint8Array(await output.blob.arrayBuffer()),
          }))
        );
        const zipBlob = buildZip(entries);
        built = {
          blob: zipBlob,
          url: URL.createObjectURL(zipBlob),
          size: zipBlob.size,
          fileCount: outputs.length,
          isZip: true,
        };
      }

      resultRef.current = built;
      setResult(built);
    } catch (error) {
      const message =
        error instanceof PdfRenderError
          ? error.message
          : "Something went wrong while converting this PDF. Please try again.";
      toast.error(message);
    } finally {
      setIsConverting(false);
    }
  }, [sourceFile, pages, format, clearResult]);

  const reset = useCallback(() => {
    clearResult();
    clearFile();
    setPages([]);
    setFormat("png");
    setOutputFilenameState(DEFAULT_CONVERT_FILENAME);
    renderedForFileId.current = null;
    filenameTouched.current = false;
    setIsConverting(false);
    setIsRenderingThumbnails(false);
  }, [clearResult, clearFile]);

  const canConvert =
    !!sourceFile &&
    sourceFile.status === "ready" &&
    !isRenderingThumbnails &&
    !isConverting &&
    selectedCount > 0;

  const extension = format === "png" ? "png" : "jpg";
  const buildOutputName = useCallback(() => {
    const base = sanitizeFilename(outputFilename);
    return result?.isZip ? `${base}.zip` : `${base}.${extension}`;
  }, [outputFilename, result, extension]);

  return {
    sourceFile,
    addFile,
    pages,
    togglePage,
    selectAll,
    selectNone,
    selectedCount,
    format,
    setFormat,
    outputFilename,
    setOutputFilename,
    isRenderingThumbnails,
    isConverting,
    result,
    convert,
    reset,
    canConvert,
    buildOutputName,
  };
}
