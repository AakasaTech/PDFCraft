import { PDFDocument } from "pdf-lib";

export interface PdfMetadataResult {
  pageCount: number;
}

export class PdfLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfLoadError";
  }
}

/**
 * Loads a PDF's metadata (currently page count). Throws PdfLoadError with a
 * user-friendly message on corrupted or password-protected files.
 */
export async function readPdfMetadata(file: File): Promise<PdfMetadataResult> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    return { pageCount: doc.getPageCount() };
  } catch {
    throw new PdfLoadError(
      "This PDF could not be opened. It may be corrupted or password protected."
    );
  }
}
