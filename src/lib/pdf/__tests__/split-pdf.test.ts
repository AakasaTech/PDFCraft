import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  parsePageRanges,
  splitPdfByRanges,
  PdfSplitError,
} from "@/lib/pdf/split-pdf";
import { createCorruptPdfFile, createTestPdfFile } from "@/test/create-test-pdf";

describe("parsePageRanges", () => {
  it("parses comma-separated ranges into 0-indexed page arrays", () => {
    expect(parsePageRanges("1-3, 4-6", 10)).toEqual([
      [0, 1, 2],
      [3, 4, 5],
    ]);
  });

  it("parses single pages", () => {
    expect(parsePageRanges("1, 3, 5", 10)).toEqual([[0], [2], [4]]);
  });

  it("tolerates extra whitespace around numbers and dashes", () => {
    expect(parsePageRanges(" 1 - 3 , 5 ", 10)).toEqual([[0, 1, 2], [4]]);
  });

  it("ignores empty tokens from trailing commas", () => {
    expect(parsePageRanges("1-2,,4", 10)).toEqual([[0, 1], [3]]);
  });

  it("throws for empty input", () => {
    expect(() => parsePageRanges("", 10)).toThrow(PdfSplitError);
    expect(() => parsePageRanges("   ", 10)).toThrow(PdfSplitError);
  });

  it("throws for a non-numeric token", () => {
    expect(() => parsePageRanges("a-b", 10)).toThrow(PdfSplitError);
  });

  it("throws when a range's start is after its end", () => {
    expect(() => parsePageRanges("5-2", 10)).toThrow(PdfSplitError);
  });

  it("throws when a page number is out of bounds", () => {
    expect(() => parsePageRanges("0", 10)).toThrow(PdfSplitError);
    expect(() => parsePageRanges("11", 10)).toThrow(PdfSplitError);
  });
});

describe("splitPdfByRanges", () => {
  it("produces one output PDF per range with the correct page counts", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 10 });

    const outputs = await splitPdfByRanges(file, [[0, 1, 2], [3, 4, 5], [7]]);

    expect(outputs).toHaveLength(3);
    expect(outputs[0].result.pageCount).toBe(3);
    expect(outputs[1].result.pageCount).toBe(3);
    expect(outputs[2].result.pageCount).toBe(1);
  });

  it("names single-page and multi-page ranges distinctly", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 10 });

    const outputs = await splitPdfByRanges(file, [[0, 1, 2], [7]]);

    expect(outputs[0].name).toBe("pages-1-3.pdf");
    expect(outputs[1].name).toBe("page-8.pdf");
  });

  it("preserves page content/order within each output", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]);
    doc.addPage([200, 200]);
    doc.addPage([300, 300]);
    const file = new File([new Uint8Array(await doc.save())], "doc.pdf", {
      type: "application/pdf",
    });

    const outputs = await splitPdfByRanges(file, [[2, 0]]);
    const rebuilt = await PDFDocument.load(await outputs[0].result.blob.arrayBuffer());
    const widths = rebuilt.getPages().map((p) => p.getWidth());

    expect(widths).toEqual([300, 100]);
  });

  it("throws a friendly error for a corrupted PDF", async () => {
    const file = createCorruptPdfFile("corrupt.pdf");

    await expect(splitPdfByRanges(file, [[0]])).rejects.toThrow(PdfSplitError);
  });

  it("throws when given no ranges", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 1 });

    await expect(splitPdfByRanges(file, [])).rejects.toThrow(PdfSplitError);
  });
});
