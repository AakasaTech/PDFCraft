import { PDFDocument } from "pdf-lib";

interface CreateTestPdfOptions {
  pageCount?: number;
  pageSize?: [number, number];
  encrypted?: boolean;
}

export async function createTestPdfFile(
  name: string,
  { pageCount = 1, pageSize = [612, 792] }: CreateTestPdfOptions = {}
): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) {
    doc.addPage(pageSize);
  }
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], name, { type: "application/pdf" });
}

export function createCorruptPdfFile(name: string): File {
  return new File([new Uint8Array([1, 2, 3, 4, 5])], name, { type: "application/pdf" });
}

export function createNonPdfFile(name: string): File {
  return new File(["not a pdf"], name, { type: "text/plain" });
}
