import { describe, expect, it } from "vitest";
import { readPdfMetadata, PdfLoadError } from "@/lib/pdf/pdf-metadata";
import { createCorruptPdfFile, createTestPdfFile } from "@/test/create-test-pdf";

describe("readPdfMetadata", () => {
  it("returns the correct page count", async () => {
    const file = await createTestPdfFile("doc.pdf", { pageCount: 7 });
    const metadata = await readPdfMetadata(file);
    expect(metadata.pageCount).toBe(7);
  });

  it("throws PdfLoadError for a corrupted file", async () => {
    const file = createCorruptPdfFile("corrupt.pdf");
    await expect(readPdfMetadata(file)).rejects.toBeInstanceOf(PdfLoadError);
  });
});
