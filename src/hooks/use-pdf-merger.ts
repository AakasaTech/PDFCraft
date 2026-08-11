"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { PdfFileItem, MergeResult } from "@/types/pdf";
import { generateId, buildOutputFilename } from "@/lib/file-utils";
import {
  validateFileType,
  validateFileSize,
  validateCombinedSize,
} from "@/lib/pdf/validation";
import { readPdfMetadata, PdfLoadError } from "@/lib/pdf/pdf-metadata";
import { mergePdfs, PdfMergeError } from "@/lib/pdf/merge-pdfs";
import { DEFAULT_OUTPUT_FILENAME } from "@/lib/constants";

export function usePdfMerger() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [outputFilename, setOutputFilename] = useState(DEFAULT_OUTPUT_FILENAME);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const mergeResultRef = useRef<MergeResult | null>(null);

  const loadMetadataFor = useCallback(async (id: string, file: File) => {
    try {
      const { pageCount } = await readPdfMetadata(file);
      setFiles((current) =>
        current.map((item) =>
          item.id === id ? { ...item, pageCount, status: "ready" } : item
        )
      );
    } catch (error) {
      const message =
        error instanceof PdfLoadError
          ? error.message
          : "This PDF could not be opened. It may be corrupted or password protected.";
      setFiles((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "error", error: message } : item
        )
      );
      toast.error(message);
    }
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArray = Array.from(incoming);
      if (incomingArray.length === 0) return;

      const currentTotal = files.reduce((sum, item) => sum + item.size, 0);
      const accepted: PdfFileItem[] = [];
      let runningTotal = currentTotal;

      for (const file of incomingArray) {
        const typeResult = validateFileType(file);
        if (!typeResult.valid) {
          toast.error(typeResult.error);
          continue;
        }

        const sizeResult = validateFileSize(file);
        if (!sizeResult.valid) {
          toast.error(sizeResult.error);
          continue;
        }

        const combinedResult = validateCombinedSize(runningTotal + file.size);
        if (!combinedResult.valid) {
          toast.error(combinedResult.error);
          continue;
        }

        runningTotal += file.size;
        accepted.push({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          pageCount: 0,
          status: "processing",
        });
      }

      if (accepted.length === 0) return;

      setFiles((current) => [...current, ...accepted]);
      for (const item of accepted) {
        void loadMetadataFor(item.id, item.file);
      }
    },
    [files, loadMetadataFor]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  }, []);

  const reorderFiles = useCallback((newOrder: PdfFileItem[]) => {
    setFiles(newOrder);
  }, []);

  const clearMergeResult = useCallback(() => {
    if (mergeResultRef.current) {
      URL.revokeObjectURL(mergeResultRef.current.url);
      mergeResultRef.current = null;
    }
    setMergeResult(null);
  }, []);

  const merge = useCallback(async () => {
    const readyFiles = files.filter((item) => item.status === "ready");
    if (readyFiles.length < 2) {
      toast.error("Select at least two valid PDF files to merge.");
      return;
    }

    setIsMerging(true);
    clearMergeResult();

    try {
      const result = await mergePdfs(readyFiles);
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
  }, [files, clearMergeResult]);

  const reset = useCallback(() => {
    clearMergeResult();
    setFiles([]);
    setOutputFilename(DEFAULT_OUTPUT_FILENAME);
    setIsMerging(false);
  }, [clearMergeResult]);

  const readyFiles = files.filter((item) => item.status === "ready");
  const totalPages = readyFiles.reduce((sum, item) => sum + item.pageCount, 0);
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);
  const isProcessing = files.some((item) => item.status === "processing");
  const canMerge = readyFiles.length >= 2 && !isProcessing && !isMerging;

  return {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    outputFilename,
    setOutputFilename,
    isMerging,
    mergeResult,
    merge,
    reset,
    totalPages,
    totalSize,
    isProcessing,
    canMerge,
    buildOutputFilename: () => buildOutputFilename(outputFilename),
  };
}
