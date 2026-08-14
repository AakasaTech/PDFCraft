import { PDFDocument } from "pdf-lib";
import type { ImageFileItem, PdfBuildResult } from "@/types/pdf";

export class PdfConvertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfConvertError";
  }
}

/** Picks the pdf-lib embedder to use based on the file's MIME type/extension. */
export function detectImageFormat(item: Pick<ImageFileItem, "name" | "file">): "png" | "jpeg" {
  const mimeType = item.file.type;
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpeg";
  return item.name.toLowerCase().endsWith(".png") ? "png" : "jpeg";
}

// Treats image pixels as a 96 DPI source (a common scan/screen default) so
// pages come out at a normal physical size instead of gigantic (e.g. a
// 4000px-wide photo would otherwise become a 4000pt-wide PDF page).
const POINTS_PER_PIXEL = 72 / 96;

/** Builds a PDF with one page per image, sized to each image's own aspect ratio. */
export async function buildPdfFromImages(items: ImageFileItem[]): Promise<PdfBuildResult> {
  if (items.length === 0) {
    throw new PdfConvertError("Add at least one image to convert.");
  }

  const outputDoc = await PDFDocument.create();

  for (const item of items) {
    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(await item.file.arrayBuffer());
    } catch {
      throw new PdfConvertError(`"${item.name}" could not be read.`);
    }

    const format = detectImageFormat(item);
    let image;
    try {
      image = format === "png" ? await outputDoc.embedPng(bytes) : await outputDoc.embedJpg(bytes);
    } catch {
      throw new PdfConvertError(`"${item.name}" could not be opened. It may be corrupted.`);
    }

    const width = image.width * POINTS_PER_PIXEL;
    const height = image.height * POINTS_PER_PIXEL;
    const page = outputDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
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
