import { PDFDocument, degrees } from "pdf-lib";
import { addWatermark, addPageNumbers, type WatermarkOptions, type PageNumberOptions } from "@/lib/pdf/stamp-pdf";
import type { PdfBuildResult } from "@/types/pdf";

export class PdfOrganizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfOrganizeError";
  }
}

/** One output page: which source page to copy, plus any extra rotation to apply. */
export interface OrganizePageOp {
  sourceIndex: number;
  rotationDelta: 0 | 90 | 180 | 270;
}

export interface StampOptions {
  watermark?: WatermarkOptions;
  pageNumbers?: PageNumberOptions;
}

/**
 * Rebuilds a PDF from a source file according to an ordered list of page
 * operations. Supports reordering, deleting (omit from the list), duplicating
 * (repeat a sourceIndex), and rotating (rotationDelta added to the page's
 * existing rotation) — all in a single pass. Optionally stamps a watermark
 * and/or page numbers onto the result (used by Organize; Split's "Select
 * Pages" extract mode reuses this function without stamps).
 */
export async function buildOrganizedPdf(
  file: File,
  pageOps: OrganizePageOp[],
  stamps?: StampOptions
): Promise<PdfBuildResult> {
  if (pageOps.length === 0) {
    throw new PdfOrganizeError("The PDF must have at least one page.");
  }

  let sourceDoc: PDFDocument;
  try {
    const arrayBuffer = await file.arrayBuffer();
    sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch {
    throw new PdfOrganizeError(
      `"${file.name}" could not be opened. It may be corrupted or password protected.`
    );
  }

  const outputDoc = await PDFDocument.create();
  const copiedPages = await outputDoc.copyPages(
    sourceDoc,
    pageOps.map((op) => op.sourceIndex)
  );

  copiedPages.forEach((page, i) => {
    const { rotationDelta } = pageOps[i];
    if (rotationDelta !== 0) {
      const currentAngle = page.getRotation().angle;
      page.setRotation(degrees((currentAngle + rotationDelta) % 360));
    }
    outputDoc.addPage(page);
  });

  if (stamps?.watermark) {
    await addWatermark(outputDoc, stamps.watermark);
  }
  if (stamps?.pageNumbers) {
    await addPageNumbers(outputDoc, stamps.pageNumbers);
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
