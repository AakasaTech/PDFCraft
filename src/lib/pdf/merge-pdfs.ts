import { PDFDocument } from "pdf-lib";
import type { PdfFileItem, MergeResult } from "@/types/pdf";

export class PdfMergeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfMergeError";
  }
}

/**
 * Merges PDF files in the given order into a single PDF, preserving each
 * page's original dimensions, orientation, and contents.
 */
export async function mergePdfs(items: PdfFileItem[]): Promise<MergeResult> {
  if (items.length < 2) {
    throw new PdfMergeError("Select at least two PDF files to merge.");
  }

  const outputDoc = await PDFDocument.create();

  for (const item of items) {
    let sourceDoc: PDFDocument;
    try {
      const arrayBuffer = await item.file.arrayBuffer();
      sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    } catch {
      throw new PdfMergeError(
        `"${item.name}" could not be merged. It may be corrupted or password protected.`
      );
    }

    const pageIndices = sourceDoc.getPageIndices();
    const copiedPages = await outputDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      outputDoc.addPage(page);
    }
  }

  const bytes = await outputDoc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount: outputDoc.getPageCount(),
    size: blob.size,
  };
}
