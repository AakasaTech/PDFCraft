import type { PDFDocumentProxy } from "pdfjs-dist";

const THUMBNAIL_WIDTH = 220;

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    // Served from public/ — copied from node_modules at install time by
    // scripts/copy-pdf-worker.mjs (see package.json "postinstall").
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjsLib;
}

export class PdfRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfRenderError";
  }
}

export interface PdfRenderSession {
  pdf: PDFDocumentProxy;
  /** Releases the worker-side document and its cached resources. */
  destroy: () => Promise<void>;
}

/** Opens a PDF for repeated page rendering. Caller must call `.destroy()` when done. */
export async function openPdfForRendering(file: File): Promise<PdfRenderSession> {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    return { pdf, destroy: () => loadingTask.destroy() };
  } catch {
    throw new PdfRenderError(
      "This PDF could not be opened. It may be corrupted or password protected."
    );
  }
}

/** Renders a single page (1-indexed) to a PNG data URL, scaled to a thumbnail width. */
export async function renderPageThumbnail(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  maxWidth: number = THUMBNAIL_WIDTH
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new PdfRenderError("Preview is not supported in this browser.");
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
}
