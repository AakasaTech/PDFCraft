import { PDFDocument } from "pdf-lib";
import type { PdfBuildResult } from "@/types/pdf";

export class PdfSignError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfSignError";
  }
}

/**
 * Where a signature image lands on a page, as ratios of the page's own
 * dimensions (0–1) rather than absolute points — keeps placement resolution
 * -independent between the UI's preview size and the PDF's actual page size.
 */
export interface SignaturePlacement {
  pageIndex: number;
  /** Left edge, as a fraction of page width. */
  xRatio: number;
  /** Bottom edge, as a fraction of page height (PDF coordinates are bottom-up). */
  yRatio: number;
  /** Signature width, as a fraction of page width. Height follows the image's own aspect ratio. */
  widthRatio: number;
}

/** Where the user clicked to place a signature, in screen/page-fraction terms (top-down y). */
export interface CenterPlacement {
  /** Signature's horizontal center, as a fraction of page width. */
  xRatioCenter: number;
  /** Signature's vertical center, as a fraction of page height, measured from the TOP. */
  yRatioCenterFromTop: number;
  widthRatio: number;
}

/**
 * Converts a center-anchored, top-down UI click position into pdf-lib's
 * bottom-left-origin, left/bottom-edge `SignaturePlacement`. Page-fraction
 * ratios are resolution-independent, so this only needs each element's
 * aspect ratio (not their actual pixel/point dimensions) to convert between
 * "click center + width" and "left edge + bottom edge (y-up)".
 */
export function toSignaturePlacement(
  pageIndex: number,
  center: CenterPlacement,
  pageAspectRatio: number,
  signatureAspectRatio: number
): SignaturePlacement {
  const heightRatioOfPage = center.widthRatio * signatureAspectRatio * pageAspectRatio;
  return {
    pageIndex,
    xRatio: center.xRatioCenter - center.widthRatio / 2,
    yRatio: 1 - center.yRatioCenterFromTop - heightRatioOfPage / 2,
    widthRatio: center.widthRatio,
  };
}

/** Stamps a signature image (PNG, transparent background) onto one page of a PDF. */
export async function signPdf(
  file: File,
  signaturePngBytes: Uint8Array,
  placement: SignaturePlacement
): Promise<PdfBuildResult> {
  let doc: PDFDocument;
  try {
    const arrayBuffer = await file.arrayBuffer();
    doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch {
    throw new PdfSignError(
      `"${file.name}" could not be opened. It may be corrupted or password protected.`
    );
  }

  const pageCount = doc.getPageCount();
  if (placement.pageIndex < 0 || placement.pageIndex >= pageCount) {
    throw new PdfSignError("Selected page is out of range.");
  }

  let image;
  try {
    image = await doc.embedPng(signaturePngBytes);
  } catch {
    throw new PdfSignError("Could not add the signature to this PDF.");
  }

  const page = doc.getPage(placement.pageIndex);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const width = pageWidth * placement.widthRatio;
  const height = width * (image.height / image.width);
  const x = pageWidth * placement.xRatio;
  const y = pageHeight * placement.yRatio;

  page.drawImage(image, { x, y, width, height });

  const bytes = await doc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount: doc.getPageCount(),
    size: blob.size,
  };
}
