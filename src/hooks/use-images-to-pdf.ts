"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useImageFileQueue } from "@/hooks/use-image-file-queue";
import { buildPdfFromImages, PdfConvertError } from "@/lib/pdf/images-to-pdf";
import { buildOutputFilename } from "@/lib/file-utils";
import { DEFAULT_CONVERT_FILENAME } from "@/lib/constants";
import type { PdfBuildResult } from "@/types/pdf";

export function useImagesToPdf() {
  const queue = useImageFileQueue();
  const [outputFilename, setOutputFilename] = useState(DEFAULT_CONVERT_FILENAME);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<PdfBuildResult | null>(null);
  const resultRef = useRef<PdfBuildResult | null>(null);

  const clearResult = useCallback(() => {
    if (resultRef.current) {
      URL.revokeObjectURL(resultRef.current.url);
      resultRef.current = null;
    }
    setResult(null);
  }, []);

  const convert = useCallback(async () => {
    if (queue.readyFiles.length === 0) {
      toast.error("Add at least one image to convert.");
      return;
    }

    setIsConverting(true);
    clearResult();

    try {
      const built = await buildPdfFromImages(queue.readyFiles);
      resultRef.current = built;
      setResult(built);
    } catch (error) {
      const message =
        error instanceof PdfConvertError
          ? error.message
          : "Something went wrong while creating your PDF. Please try again.";
      toast.error(message);
    } finally {
      setIsConverting(false);
    }
  }, [queue.readyFiles, clearResult]);

  const reset = useCallback(() => {
    clearResult();
    queue.clearFiles();
    setOutputFilename(DEFAULT_CONVERT_FILENAME);
    setIsConverting(false);
  }, [clearResult, queue]);

  const canConvert = queue.readyFiles.length > 0 && !queue.isProcessing && !isConverting;

  return {
    files: queue.files,
    addFiles: queue.addFiles,
    removeFile: queue.removeFile,
    reorderFiles: queue.reorderFiles,
    totalSize: queue.totalSize,
    isProcessing: queue.isProcessing,
    outputFilename,
    setOutputFilename,
    isConverting,
    result,
    convert,
    reset,
    canConvert,
    buildOutputName: () => buildOutputFilename(outputFilename),
  };
}
