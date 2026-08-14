import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addWatermark, addPageNumbers } from "@/lib/pdf/stamp-pdf";
import { pdfContainsDrawnText } from "@/test/pdf-inspect";

async function createDoc(pageCount = 1): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) doc.addPage([400, 500]);
  return doc;
}

describe("addWatermark", () => {
  it("draws the watermark text onto the page", async () => {
    const doc = await createDoc(1);
    await addWatermark(doc, { text: "CONFIDENTIAL" });
    const bytes = await doc.save();

    expect(pdfContainsDrawnText(bytes, "CONFIDENTIAL")).toBe(true);
  });

  it("draws onto every page", async () => {
    const doc = await createDoc(3);
    await addWatermark(doc, { text: "DRAFT" });

    for (const page of doc.getPages()) {
      // Each page keeps its own content stream, so re-saving a fresh single
      // -page copy is the simplest way to inspect one page in isolation.
      const single = await PDFDocument.create();
      const [copied] = await single.copyPages(doc, [doc.getPages().indexOf(page)]);
      single.addPage(copied);
      const bytes = await single.save();
      expect(pdfContainsDrawnText(bytes, "DRAFT")).toBe(true);
    }
  });

  it("is a no-op for blank or whitespace-only text", async () => {
    const doc = await createDoc(1);
    const before = await doc.save();

    await addWatermark(doc, { text: "   " });
    const after = await doc.save();

    // Re-saving is deterministic here (no random IDs added by our code), so
    // an unchanged byte length is a reasonable proxy for "nothing was drawn".
    expect(after.length).toBe(before.length);
  });

  it("does not throw for an empty document", async () => {
    const doc = await PDFDocument.create();
    await expect(addWatermark(doc, { text: "TEST" })).resolves.not.toThrow();
  });
});

describe("addPageNumbers", () => {
  it("draws page numbers with the total page count", async () => {
    const doc = await createDoc(1);
    await addPageNumbers(doc);
    const bytes = await doc.save();

    expect(pdfContainsDrawnText(bytes, "Page 1 of 1")).toBe(true);
  });

  it("increments the printed number across pages", async () => {
    const doc = await createDoc(3);
    await addPageNumbers(doc);

    for (let i = 0; i < 3; i += 1) {
      const single = await PDFDocument.create();
      const [copied] = await single.copyPages(doc, [i]);
      single.addPage(copied);
      const bytes = await single.save();
      expect(pdfContainsDrawnText(bytes, `Page ${i + 1} of 3`)).toBe(true);
    }
  });

  it("respects a custom starting number", async () => {
    const doc = await createDoc(1);
    await addPageNumbers(doc, { startAt: 5 });
    const bytes = await doc.save();

    expect(pdfContainsDrawnText(bytes, "Page 5 of 1")).toBe(true);
  });

  it("uses the number-only format when requested", async () => {
    const doc = await createDoc(1);
    await addPageNumbers(doc, { format: "number" });
    const bytes = await doc.save();

    expect(pdfContainsDrawnText(bytes, "Page 1 of 1")).toBe(false);
    expect(pdfContainsDrawnText(bytes, "1")).toBe(true);
  });

  it("preserves page count and dimensions", async () => {
    const doc = await createDoc(2);
    await addPageNumbers(doc);

    expect(doc.getPageCount()).toBe(2);
    expect(doc.getPage(0).getWidth()).toBe(400);
    expect(doc.getPage(0).getHeight()).toBe(500);
  });
});
