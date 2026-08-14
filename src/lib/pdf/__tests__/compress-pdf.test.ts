import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { compressPdf, PdfCompressError } from "@/lib/pdf/compress-pdf";
import { createCorruptPdfFile } from "@/test/create-test-pdf";

async function createPdfWithMetadata(name: string): Promise<File> {
  const doc = await PDFDocument.create();
  doc.addPage([612, 792]);
  doc.setTitle("Secret Report");
  doc.setAuthor("Jane Doe");
  doc.setSubject("Confidential");
  doc.setKeywords(["secret", "internal"]);
  doc.setProducer("Acme PDF Producer");
  doc.setCreator("Acme PDF Creator");
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], name, { type: "application/pdf" });
}

describe("compressPdf", () => {
  it("strips document metadata", async () => {
    const file = await createPdfWithMetadata("report.pdf");

    const result = await compressPdf(file);
    // updateMetadata: false — otherwise PDFDocument.load() re-stamps its own
    // Producer/ModDate on load, clobbering the very values we're checking.
    const rebuilt = await PDFDocument.load(await result.blob.arrayBuffer(), {
      updateMetadata: false,
    });

    expect(rebuilt.getTitle()).toBeFalsy();
    expect(rebuilt.getAuthor()).toBeFalsy();
    expect(rebuilt.getSubject()).toBeFalsy();
    expect(rebuilt.getKeywords()).toBeFalsy();
    expect(rebuilt.getProducer()).toBeFalsy();
    expect(rebuilt.getCreator()).toBeFalsy();
  });

  it("preserves page count and page dimensions", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    doc.addPage([500, 600]);
    const file = new File([new Uint8Array(await doc.save())], "doc.pdf", {
      type: "application/pdf",
    });

    const result = await compressPdf(file);
    expect(result.pageCount).toBe(2);

    const rebuilt = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(rebuilt.getPage(0).getWidth()).toBe(300);
    expect(rebuilt.getPage(1).getWidth()).toBe(500);
  });

  it("reports the original file size alongside the compressed size", async () => {
    const file = await createPdfWithMetadata("report.pdf");

    const result = await compressPdf(file);

    expect(result.originalSize).toBe(file.size);
    expect(result.size).toBeGreaterThan(0);
  });

  it("throws a friendly error for a corrupted PDF", async () => {
    const file = createCorruptPdfFile("corrupt.pdf");

    await expect(compressPdf(file)).rejects.toThrow(PdfCompressError);
  });
});
