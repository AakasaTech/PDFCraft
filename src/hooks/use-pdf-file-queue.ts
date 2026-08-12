"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PdfFileItem } from "@/types/pdf";
import { generateId } from "@/lib/file-utils";
import {
  validateFileType,
  validateFileSize,
  validateCombinedSize,
} from "@/lib/pdf/validation";
import { readPdfMetadata, PdfLoadError } from "@/lib/pdf/pdf-metadata";

/**
 * Generic PDF upload queue: validation, page-count loading, reordering, and
 * removal. Shared by every tool (Merge, Organize, Split, Convert, ...) —
 * tool-specific hooks wrap this with their own transform/output logic.
 */
export function usePdfFileQueue() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);

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

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const readyFiles = files.filter((item) => item.status === "ready");
  const totalPages = readyFiles.reduce((sum, item) => sum + item.pageCount, 0);
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);
  const isProcessing = files.some((item) => item.status === "processing");

  return {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    clearFiles,
    readyFiles,
    totalPages,
    totalSize,
    isProcessing,
  };
}
