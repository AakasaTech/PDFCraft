import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs, PdfMergeError } from "@/lib/pdf/merge-pdfs";
import { createCorruptPdfFile, createTestPdfFile } from "@/test/create-test-pdf";
import type { PdfFileItem } from "@/types/pdf";

function toItem(file: File, pageCount: number, overrides: Partial<PdfFileItem> = {}): PdfFileItem {
  return {
    id: file.name,
    file,
    name: file.name,
    size: file.size,
    pageCount,
    status: "ready",
    ...overrides,
  };
}

describe("mergePdfs", () => {
  it("merges two one-page PDFs into a single two-page PDF", async () => {
    const a = await createTestPdfFile("a.pdf", { pageCount: 1 });
    const b = await createTestPdfFile("b.pdf", { pageCount: 1 });

    const result = await mergePdfs([toItem(a, 1), toItem(b, 1)]);

    expect(result.pageCount).toBe(2);
    const merged = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(merged.getPageCount()).toBe(2);
  });

  it("merges documents with multiple pages", async () => {
    const a = await createTestPdfFile("a.pdf", { pageCount: 3 });
    const b = await createTestPdfFile("b.pdf", { pageCount: 5 });

    const result = await mergePdfs([toItem(a, 3), toItem(b, 5)]);

    expect(result.pageCount).toBe(8);
  });

  it("preserves the selected document order", async () => {
    // First doc: 612x792 page. Second doc: 300x300 page.
    // Merged page 0 should match doc A's size, page 1 should match doc B's size.
    const a = await createTestPdfFile("a.pdf", { pageCount: 1, pageSize: [612, 792] });
    const b = await createTestPdfFile("b.pdf", { pageCount: 1, pageSize: [300, 300] });

    const result = await mergePdfs([toItem(a, 1), toItem(b, 1)]);
    const merged = await PDFDocument.load(await result.blob.arrayBuffer());

    const [firstPage, secondPage] = merged.getPages();
    expect(firstPage.getWidth()).toBe(612);
    expect(secondPage.getWidth()).toBe(300);

    // Reversed order should flip which size comes first.
    const reversed = await mergePdfs([toItem(b, 1), toItem(a, 1)]);
    const mergedReversed = await PDFDocument.load(await reversed.blob.arrayBuffer());
    const [firstReversed] = mergedReversed.getPages();
    expect(firstReversed.getWidth()).toBe(300);
  });

  it("preserves mixed page dimensions within the merged output", async () => {
    const portrait = await createTestPdfFile("portrait.pdf", {
      pageCount: 1,
      pageSize: [612, 792],
    });
    const landscape = await createTestPdfFile("landscape.pdf", {
      pageCount: 1,
      pageSize: [792, 612],
    });

    const result = await mergePdfs([toItem(portrait, 1), toItem(landscape, 1)]);
    const merged = await PDFDocument.load(await result.blob.arrayBuffer());
    const [page1, page2] = merged.getPages();

    expect([page1.getWidth(), page1.getHeight()]).toEqual([612, 792]);
    expect([page2.getWidth(), page2.getHeight()]).toEqual([792, 612]);
  });

  it("allows the same PDF to be merged as a duplicate", async () => {
    const a = await createTestPdfFile("a.pdf", { pageCount: 2 });
    const item = toItem(a, 2);

    const result = await mergePdfs([item, { ...item, id: "a-copy" }]);

    expect(result.pageCount).toBe(4);
  });

  it("throws a friendly error for a corrupted PDF", async () => {
    const good = await createTestPdfFile("good.pdf", { pageCount: 1 });
    const corrupt = createCorruptPdfFile("corrupt.pdf");

    await expect(mergePdfs([toItem(good, 1), toItem(corrupt, 0)])).rejects.toThrow(
      PdfMergeError
    );
  });

  it("throws when fewer than two files are provided", async () => {
    const a = await createTestPdfFile("a.pdf", { pageCount: 1 });

    await expect(mergePdfs([toItem(a, 1)])).rejects.toThrow(PdfMergeError);
  });
});
