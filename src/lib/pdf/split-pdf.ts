import { PDFDocument } from "pdf-lib";
import type { PdfBuildResult } from "@/types/pdf";

export class PdfSplitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfSplitError";
  }
}

/**
 * Parses a page-range string like "1-3, 4-6, 8" into 0-indexed page-index
 * arrays, one per comma-separated token, in the order given.
 */
export function parsePageRanges(input: string, pageCount: number): number[][] {
  const tokens = input
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    throw new PdfSplitError("Enter at least one page or page range, e.g. 1-3, 5.");
  }

  const ranges: number[][] = [];

  for (const token of tokens) {
    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = token.match(/^(\d+)$/);

    let start: number;
    let end: number;

    if (rangeMatch) {
      start = Number(rangeMatch[1]);
      end = Number(rangeMatch[2]);
    } else if (singleMatch) {
      start = end = Number(singleMatch[1]);
    } else {
      throw new PdfSplitError(`"${token}" is not a valid page or range.`);
    }

    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      throw new PdfSplitError(
        `"${token}" is out of range — this PDF has ${pageCount} ${pageCount === 1 ? "page" : "pages"}.`
      );
    }
    if (start > end) {
      throw new PdfSplitError(`"${token}" is invalid — the start page must come before the end page.`);
    }

    const pageIndices: number[] = [];
    for (let page = start; page <= end; page += 1) {
      pageIndices.push(page - 1);
    }
    ranges.push(pageIndices);
  }

  return ranges;
}

function rangeFilename(pageIndices: number[]): string {
  const first = pageIndices[0] + 1;
  const last = pageIndices[pageIndices.length - 1] + 1;
  return first === last ? `page-${first}.pdf` : `pages-${first}-${last}.pdf`;
}

export interface SplitOutput {
  name: string;
  result: PdfBuildResult;
}

/** Splits a PDF into one output document per page-index range. */
export async function splitPdfByRanges(
  file: File,
  ranges: number[][]
): Promise<SplitOutput[]> {
  if (ranges.length === 0) {
    throw new PdfSplitError("Enter at least one page or page range, e.g. 1-3, 5.");
  }

  let sourceDoc: PDFDocument;
  try {
    const arrayBuffer = await file.arrayBuffer();
    sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch {
    throw new PdfSplitError(
      `"${file.name}" could not be opened. It may be corrupted or password protected.`
    );
  }

  const outputs: SplitOutput[] = [];

  for (const pageIndices of ranges) {
    const outputDoc = await PDFDocument.create();
    const copiedPages = await outputDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      outputDoc.addPage(page);
    }

    const bytes = await outputDoc.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    outputs.push({
      name: rangeFilename(pageIndices),
      result: { blob, url, pageCount: outputDoc.getPageCount(), size: blob.size },
    });
  }

  return outputs;
}
