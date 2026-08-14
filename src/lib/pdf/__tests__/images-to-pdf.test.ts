import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildPdfFromImages, detectImageFormat, PdfConvertError } from "@/lib/pdf/images-to-pdf";
import { createTestPngFile } from "@/test/create-test-image";
import type { ImageFileItem } from "@/types/pdf";

function toItem(file: File, overrides: Partial<ImageFileItem> = {}): ImageFileItem {
  return {
    id: file.name,
    file,
    name: file.name,
    size: file.size,
    status: "ready",
    ...overrides,
  };
}

describe("detectImageFormat", () => {
  it("detects PNG by MIME type", () => {
    const file = new File([new Uint8Array([1])], "photo.dat", { type: "image/png" });
    expect(detectImageFormat({ name: file.name, file })).toBe("png");
  });

  it("detects JPEG by MIME type", () => {
    const file = new File([new Uint8Array([1])], "photo.dat", { type: "image/jpeg" });
    expect(detectImageFormat({ name: file.name, file })).toBe("jpeg");
  });

  it("falls back to the .png extension when MIME type is missing", () => {
    const file = new File([new Uint8Array([1])], "scan.PNG", { type: "" });
    expect(detectImageFormat({ name: file.name, file })).toBe("png");
  });

  it("falls back to jpeg for any other extension when MIME type is missing", () => {
    const file = new File([new Uint8Array([1])], "photo.jpg", { type: "" });
    expect(detectImageFormat({ name: file.name, file })).toBe("jpeg");
  });
});

describe("buildPdfFromImages", () => {
  it("creates one page per image", async () => {
    const a = createTestPngFile("a.png", 40, 30);
    const b = createTestPngFile("b.png", 40, 30);

    const result = await buildPdfFromImages([toItem(a), toItem(b)]);

    expect(result.pageCount).toBe(2);
  });

  it("sizes each page from the image's pixel dimensions (96 DPI assumption)", async () => {
    const wide = createTestPngFile("wide.png", 200, 100);

    const result = await buildPdfFromImages([toItem(wide)]);
    const rebuilt = await PDFDocument.load(await result.blob.arrayBuffer());
    const page = rebuilt.getPage(0);

    // 72/96 points per pixel
    expect(page.getWidth()).toBeCloseTo(150, 5);
    expect(page.getHeight()).toBeCloseTo(75, 5);
  });

  it("preserves each image's own aspect ratio across mixed sizes", async () => {
    const square = createTestPngFile("square.png", 100, 100);
    const tall = createTestPngFile("tall.png", 50, 200);

    const result = await buildPdfFromImages([toItem(square), toItem(tall)]);
    const rebuilt = await PDFDocument.load(await result.blob.arrayBuffer());

    expect(rebuilt.getPage(0).getWidth()).toBeCloseTo(rebuilt.getPage(0).getHeight(), 5);
    expect(rebuilt.getPage(1).getHeight()).toBeCloseTo(rebuilt.getPage(1).getWidth() * 4, 5);
  });

  it("throws when given no images", async () => {
    await expect(buildPdfFromImages([])).rejects.toThrow(PdfConvertError);
  });

  it("throws a friendly error for a corrupted image", async () => {
    const corrupt = new File([new Uint8Array([1, 2, 3])], "corrupt.png", { type: "image/png" });

    await expect(buildPdfFromImages([toItem(corrupt)])).rejects.toThrow(PdfConvertError);
  });
});
