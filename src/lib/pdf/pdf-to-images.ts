import { openPdfForRendering, renderPageToImageBlob } from "@/lib/pdf/render-page";

export interface PdfToImageOutput {
  name: string;
  blob: Blob;
}

/** Renders selected pages (1-indexed) of a PDF to individual image files. */
export async function convertPdfToImages(
  file: File,
  pageNumbers: number[],
  format: "png" | "jpeg"
): Promise<PdfToImageOutput[]> {
  const session = await openPdfForRendering(file);
  const extension = format === "png" ? "png" : "jpg";

  try {
    const outputs: PdfToImageOutput[] = [];
    for (const pageNumber of pageNumbers) {
      const blob = await renderPageToImageBlob(session.pdf, pageNumber, { format });
      outputs.push({ name: `page-${pageNumber}.${extension}`, blob });
    }
    return outputs;
  } finally {
    await session.destroy();
  }
}
