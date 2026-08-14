"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { ImageFileItem } from "@/types/pdf";
import { generateId } from "@/lib/file-utils";
import {
  validateImageFileType,
  validateFileSize,
  validateCombinedSize,
} from "@/lib/pdf/validation";

/**
 * Multi-image upload queue for Convert's Images → PDF direction. Mirrors
 * usePdfFileQueue's shape (validate, load, reorder, remove) but validates
 * image types and reads pixel dimensions instead of PDF page counts.
 */
export function useImageFileQueue() {
  const [files, setFiles] = useState<ImageFileItem[]>([]);

  const loadDimensionsFor = useCallback(async (id: string, file: File) => {
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      setFiles((current) =>
        current.map((item) =>
          item.id === id ? { ...item, width, height, status: "ready" } : item
        )
      );
    } catch {
      const message = `"${file.name}" could not be opened. It may be corrupted.`;
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
      const accepted: ImageFileItem[] = [];
      let runningTotal = currentTotal;

      for (const file of incomingArray) {
        const typeResult = validateImageFileType(file);
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
          status: "processing",
        });
      }

      if (accepted.length === 0) return;

      setFiles((current) => [...current, ...accepted]);
      for (const item of accepted) {
        void loadDimensionsFor(item.id, item.file);
      }
    },
    [files, loadDimensionsFor]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  }, []);

  const reorderFiles = useCallback((newOrder: ImageFileItem[]) => {
    setFiles(newOrder);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const readyFiles = files.filter((item) => item.status === "ready");
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);
  const isProcessing = files.some((item) => item.status === "processing");

  return {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    clearFiles,
    readyFiles,
    totalSize,
    isProcessing,
  };
}
