import { PDFDocument, degrees } from "pdf-lib";
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

/**
 * Rebuilds a PDF from a source file according to an ordered list of page
 * operations. Supports reordering, deleting (omit from the list), duplicating
 * (repeat a sourceIndex), and rotating (rotationDelta added to the page's
 * existing rotation) — all in a single pass.
 */
export async function buildOrganizedPdf(
  file: File,
  pageOps: OrganizePageOp[]
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
