import { PDFDocument } from "pdf-lib";
import type { PdfBuildResult } from "@/types/pdf";

export class PdfCompressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfCompressError";
  }
}

export interface CompressResult extends PdfBuildResult {
  originalSize: number;
}

/**
 * "Basic" lossless compression: strips document metadata and re-serializes
 * with compressed cross-reference object streams. pdf-lib has no API for
 * recompressing embedded images or fonts, so gains are typically modest —
 * an already-optimized PDF may see little to no reduction. Real image
 * recompression would need a different (WASM-based) library.
 */
export async function compressPdf(file: File): Promise<CompressResult> {
  let doc: PDFDocument;
  try {
    const arrayBuffer = await file.arrayBuffer();
    doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch {
    throw new PdfCompressError(
      `"${file.name}" could not be opened. It may be corrupted or password protected.`
    );
  }

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");

  const bytes = await doc.save({ useObjectStreams: true });
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount: doc.getPageCount(),
    size: blob.size,
    originalSize: file.size,
  };
}
