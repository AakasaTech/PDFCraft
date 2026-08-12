import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildOrganizedPdf, PdfOrganizeError, type OrganizePageOp } from "@/lib/pdf/organize-pdf";
import { createCorruptPdfFile, createTestPdfFile } from "@/test/create-test-pdf";

describe("buildOrganizedPdf", () => {
  it("reorders pages according to the given ops", async () => {
    // 3 distinct page sizes so we can identify pages by width after reordering.
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]);
    doc.addPage([200, 200]);
    doc.addPage([300, 300]);
    const file = new File([new Uint8Array(await doc.save())], "doc.pdf", {
      type: "application/pdf",
    });

    const ops: OrganizePageOp[] = [
      { sourceIndex: 2, rotationDelta: 0 },
      { sourceIndex: 0, rotationDelta: 0 },
      { sourceIndex: 1, rotationDelta: 0 },
    ];

    const result = await buildOrganizedPdf(file, ops);
    const merged = await PDFDocument.load(await result.blob.arrayBuffer());
    const widths = merged.getPages().map((p) => p.getWidth());

    expect(widths).toEqual([300, 100, 200]);
  });

  it("omits deleted pages", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 5 });

    const ops: OrganizePageOp[] = [0, 2, 4].map((sourceIndex) => ({
      sourceIndex,
      rotationDelta: 0,
    }));

    const result = await buildOrganizedPdf(file, ops);
    expect(result.pageCount).toBe(3);
  });

  it("duplicates a page when its sourceIndex repeats", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 2 });

    const ops: OrganizePageOp[] = [
      { sourceIndex: 0, rotationDelta: 0 },
      { sourceIndex: 0, rotationDelta: 0 },
      { sourceIndex: 1, rotationDelta: 0 },
    ];

    const result = await buildOrganizedPdf(file, ops);
    expect(result.pageCount).toBe(3);
  });

  it("applies rotation on top of the page's existing rotation", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 1 });

    const result = await buildOrganizedPdf(file, [{ sourceIndex: 0, rotationDelta: 90 }]);
    const rebuilt = await PDFDocument.load(await result.blob.arrayBuffer());

    expect(rebuilt.getPage(0).getRotation().angle).toBe(90);
  });

  it("wraps rotation past 360 degrees", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 1 });

    const result = await buildOrganizedPdf(file, [{ sourceIndex: 0, rotationDelta: 270 }]);
    const rebuilt = await PDFDocument.load(await result.blob.arrayBuffer());

    expect(rebuilt.getPage(0).getRotation().angle).toBe(270);
  });

  it("throws a friendly error for a corrupted PDF", async () => {
    const file = createCorruptPdfFile("corrupt.pdf");

    await expect(
      buildOrganizedPdf(file, [{ sourceIndex: 0, rotationDelta: 0 }])
    ).rejects.toThrow(PdfOrganizeError);
  });

  it("throws when there are no page operations", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 1 });

    await expect(buildOrganizedPdf(file, [])).rejects.toThrow(PdfOrganizeError);
  });
});
