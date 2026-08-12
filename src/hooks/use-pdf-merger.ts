"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { PdfBuildResult } from "@/types/pdf";
import { buildOutputFilename } from "@/lib/file-utils";
import { mergePdfs, PdfMergeError } from "@/lib/pdf/merge-pdfs";
import { DEFAULT_OUTPUT_FILENAME } from "@/lib/constants";
import { usePdfFileQueue } from "@/hooks/use-pdf-file-queue";

export function usePdfMerger() {
  const queue = usePdfFileQueue();
  const [outputFilename, setOutputFilename] = useState(DEFAULT_OUTPUT_FILENAME);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<PdfBuildResult | null>(null);
  const mergeResultRef = useRef<PdfBuildResult | null>(null);

  const clearMergeResult = useCallback(() => {
    if (mergeResultRef.current) {
      URL.revokeObjectURL(mergeResultRef.current.url);
      mergeResultRef.current = null;
    }
    setMergeResult(null);
  }, []);

  const merge = useCallback(async () => {
    if (queue.readyFiles.length < 2) {
      toast.error("Select at least two valid PDF files to merge.");
      return;
    }

    setIsMerging(true);
    clearMergeResult();

    try {
      const result = await mergePdfs(queue.readyFiles);
      mergeResultRef.current = result;
      setMergeResult(result);
    } catch (error) {
      const message =
        error instanceof PdfMergeError
          ? error.message
          : "Something went wrong while merging your PDFs. Please try again.";
      toast.error(message);
    } finally {
      setIsMerging(false);
    }
  }, [queue.readyFiles, clearMergeResult]);

  const reset = useCallback(() => {
    clearMergeResult();
    queue.clearFiles();
    setOutputFilename(DEFAULT_OUTPUT_FILENAME);
    setIsMerging(false);
  }, [clearMergeResult, queue]);

  const canMerge = queue.readyFiles.length >= 2 && !queue.isProcessing && !isMerging;

  return {
    files: queue.files,
    addFiles: queue.addFiles,
    removeFile: queue.removeFile,
    reorderFiles: queue.reorderFiles,
    outputFilename,
    setOutputFilename,
    isMerging,
    mergeResult,
    merge,
    reset,
    totalPages: queue.totalPages,
    totalSize: queue.totalSize,
    isProcessing: queue.isProcessing,
    canMerge,
    buildOutputFilename: () => buildOutputFilename(outputFilename),
  };
}
