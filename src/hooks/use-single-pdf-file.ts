"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PdfFileItem } from "@/types/pdf";
import { generateId } from "@/lib/file-utils";
import { validateFileType, validateFileSize } from "@/lib/pdf/validation";
import { readPdfMetadata, PdfLoadError } from "@/lib/pdf/pdf-metadata";

/**
 * Single-PDF upload slot for tools that operate on exactly one document at a
 * time (Organize, Split, Compress) — as opposed to `usePdfFileQueue`, which
 * tracks a multi-file combined size limit that doesn't apply here.
 */
export function useSinglePdfFile() {
  const [file, setFile] = useState<PdfFileItem | null>(null);

  const loadMetadata = useCallback(async (id: string, rawFile: File) => {
    try {
      const { pageCount } = await readPdfMetadata(rawFile);
      setFile((current) =>
        current?.id === id ? { ...current, pageCount, status: "ready" } : current
      );
    } catch (error) {
      const message =
        error instanceof PdfLoadError
          ? error.message
          : "This PDF could not be opened. It may be corrupted or password protected.";
      setFile((current) =>
        current?.id === id ? { ...current, status: "error", error: message } : current
      );
      toast.error(message);
    }
  }, []);

  const setSourceFile = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArray = Array.from(incoming);
      if (incomingArray.length === 0) return;
      if (incomingArray.length > 1) {
        toast.error("This tool works on one PDF at a time — using the first file selected.");
      }

      const rawFile = incomingArray[0];
      const typeResult = validateFileType(rawFile);
      if (!typeResult.valid) {
        toast.error(typeResult.error);
        return;
      }
      const sizeResult = validateFileSize(rawFile);
      if (!sizeResult.valid) {
        toast.error(sizeResult.error);
        return;
      }

      const id = generateId();
      const item: PdfFileItem = {
        id,
        file: rawFile,
        name: rawFile.name,
        size: rawFile.size,
        pageCount: 0,
        status: "processing",
      };
      setFile(item);
      void loadMetadata(id, rawFile);
    },
    [loadMetadata]
  );

  const clearFile = useCallback(() => setFile(null), []);

  return { file, setSourceFile, clearFile };
}
