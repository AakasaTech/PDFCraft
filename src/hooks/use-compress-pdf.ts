"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSinglePdfFile } from "@/hooks/use-single-pdf-file";
import { compressPdf, PdfCompressError, type CompressResult } from "@/lib/pdf/compress-pdf";
import { buildOutputFilename, stripPdfExtension } from "@/lib/file-utils";
import { DEFAULT_COMPRESS_FILENAME } from "@/lib/constants";

export function useCompressPdf() {
  const { file: sourceFile, setSourceFile, clearFile } = useSinglePdfFile();
  const [outputFilename, setOutputFilenameState] = useState(DEFAULT_COMPRESS_FILENAME);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const resultRef = useRef<CompressResult | null>(null);
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
      filenameTouched.current = false;
      setSourceFile(incoming);
    },
    [clearResult, setSourceFile]
  );

  const setOutputFilename = useCallback((name: string) => {
    filenameTouched.current = true;
    setOutputFilenameState(name);
  }, []);

  useEffect(() => {
    if (sourceFile?.status === "ready" && !filenameTouched.current) {
      setOutputFilenameState(`${stripPdfExtension(sourceFile.name)}-compressed`);
    }
  }, [sourceFile]);

  const compress = useCallback(async () => {
    if (!sourceFile || sourceFile.status !== "ready") {
      toast.error("Upload a PDF first.");
      return;
    }

    setIsCompressing(true);
    clearResult();

    try {
      const built = await compressPdf(sourceFile.file);
      resultRef.current = built;
      setResult(built);
    } catch (error) {
      const message =
        error instanceof PdfCompressError
          ? error.message
          : "Something went wrong while compressing your PDF. Please try again.";
      toast.error(message);
    } finally {
      setIsCompressing(false);
    }
  }, [sourceFile, clearResult]);

  const reset = useCallback(() => {
    clearResult();
    clearFile();
    setOutputFilenameState(DEFAULT_COMPRESS_FILENAME);
    filenameTouched.current = false;
    setIsCompressing(false);
  }, [clearResult, clearFile]);

  const canCompress = !!sourceFile && sourceFile.status === "ready" && !isCompressing;

  return {
    sourceFile,
    addFile,
    outputFilename,
    setOutputFilename,
    isCompressing,
    result,
    compress,
    reset,
    canCompress,
    buildOutputName: () => buildOutputFilename(outputFilename),
  };
}
