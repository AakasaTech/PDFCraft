"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSinglePdfFile } from "@/hooks/use-single-pdf-file";
import { openPdfForRendering, renderPageThumbnail, PdfRenderError } from "@/lib/pdf/render-page";
import { buildOrganizedPdf, PdfOrganizeError } from "@/lib/pdf/organize-pdf";
import { parsePageRanges, splitPdfByRanges, PdfSplitError } from "@/lib/pdf/split-pdf";
import { buildZip } from "@/lib/zip-utils";
import {
  generateId,
  buildOutputFilename,
  stripPdfExtension,
  sanitizeFilename,
} from "@/lib/file-utils";
import { DEFAULT_OUTPUT_FILENAME } from "@/lib/constants";
import type { SplitPageItem, SplitResult } from "@/types/pdf";

export type SplitMode = "extract" | "ranges";

export function useSplitPdf() {
  const { file: sourceFile, setSourceFile, clearFile } = useSinglePdfFile();
  const [pages, setPages] = useState<SplitPageItem[]>([]);
  const [mode, setMode] = useState<SplitMode>("extract");
  const [rangesInput, setRangesInput] = useState("");
  const [outputFilename, setOutputFilenameState] = useState(DEFAULT_OUTPUT_FILENAME);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const resultRef = useRef<SplitResult | null>(null);
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
      setRangesInput("");
      setMode("extract");
      setSourceFile(incoming);
    },
    [clearResult, setSourceFile]
  );

  const setOutputFilename = useCallback((name: string) => {
    filenameTouched.current = true;
    setOutputFilenameState(name);
  }, []);

  // Render page thumbnails once the source file's page count is known.
  useEffect(() => {
    if (!sourceFile || sourceFile.status !== "ready") return;
    if (renderedForFileId.current === sourceFile.id) return;
    renderedForFileId.current = sourceFile.id;

    if (!filenameTouched.current) {
      setOutputFilenameState(stripPdfExtension(sourceFile.name));
    }

    let cancelled = false;
    setIsRenderingThumbnails(true);

    const initialPages: SplitPageItem[] = Array.from(
      { length: sourceFile.pageCount },
      (_, i) => ({ id: generateId(), sourceIndex: i, selected: false, thumbnailUrl: null })
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

  const runExtract = useCallback(async (): Promise<SplitResult> => {
    const selected = pages.filter((page) => page.selected);
    if (!sourceFile || selected.length === 0) {
      throw new PdfSplitError("Select at least one page to extract.");
    }
    const built = await buildOrganizedPdf(
      sourceFile.file,
      selected.map((page) => ({ sourceIndex: page.sourceIndex, rotationDelta: 0 as const }))
    );
    return {
      blob: built.blob,
      url: built.url,
      size: built.size,
      fileCount: 1,
      pageCount: built.pageCount,
      isZip: false,
    };
  }, [sourceFile, pages]);

  const runRanges = useCallback(async (): Promise<SplitResult> => {
    if (!sourceFile) {
      throw new PdfSplitError("Upload a PDF first.");
    }
    const ranges = parsePageRanges(rangesInput, sourceFile.pageCount);
    const outputs = await splitPdfByRanges(sourceFile.file, ranges);

    if (outputs.length === 1) {
      const only = outputs[0];
      return {
        blob: only.result.blob,
        url: only.result.url,
        size: only.result.size,
        fileCount: 1,
        pageCount: only.result.pageCount,
        isZip: false,
      };
    }

    const entries = await Promise.all(
      outputs.map(async (output) => ({
        name: output.name,
        bytes: new Uint8Array(await output.result.blob.arrayBuffer()),
      }))
    );
    // Individual object URLs are no longer needed once bundled into the zip.
    for (const output of outputs) URL.revokeObjectURL(output.result.url);

    const zipBlob = buildZip(entries);
    return {
      blob: zipBlob,
      url: URL.createObjectURL(zipBlob),
      size: zipBlob.size,
      fileCount: outputs.length,
      isZip: true,
    };
  }, [sourceFile, rangesInput]);

  const split = useCallback(async () => {
    if (!sourceFile || sourceFile.status !== "ready") {
      toast.error("Upload a PDF first.");
      return;
    }

    setIsSaving(true);
    clearResult();

    try {
      const built = mode === "extract" ? await runExtract() : await runRanges();
      resultRef.current = built;
      setResult(built);
    } catch (error) {
      const message =
        error instanceof PdfSplitError || error instanceof PdfOrganizeError
          ? error.message
          : "Something went wrong while splitting your PDF. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [sourceFile, mode, runExtract, runRanges, clearResult]);

  const reset = useCallback(() => {
    clearResult();
    clearFile();
    setPages([]);
    setRangesInput("");
    setMode("extract");
    setOutputFilenameState(DEFAULT_OUTPUT_FILENAME);
    renderedForFileId.current = null;
    filenameTouched.current = false;
    setIsSaving(false);
    setIsRenderingThumbnails(false);
  }, [clearResult, clearFile]);

  const canSplit =
    !!sourceFile &&
    sourceFile.status === "ready" &&
    !isRenderingThumbnails &&
    !isSaving &&
    (mode === "extract" ? selectedCount > 0 : rangesInput.trim().length > 0);

  const buildOutputName = useCallback(() => {
    return result?.isZip
      ? `${sanitizeFilename(outputFilename)}.zip`
      : buildOutputFilename(outputFilename);
  }, [outputFilename, result]);

  return {
    sourceFile,
    addFile,
    pages,
    togglePage,
    selectAll,
    selectNone,
    selectedCount,
    mode,
    setMode,
    rangesInput,
    setRangesInput,
    outputFilename,
    setOutputFilename,
    isRenderingThumbnails,
    isSaving,
    result,
    split,
    reset,
    canSplit,
    buildOutputName,
  };
}
