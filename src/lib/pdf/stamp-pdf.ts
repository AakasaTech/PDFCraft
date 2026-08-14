import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export interface WatermarkOptions {
  text: string;
  /** 0–1. Default 0.3. */
  opacity?: number;
  /** Defaults to an eighth of the shorter page dimension. */
  fontSize?: number;
  /** Default 45 (diagonal, bottom-left to top-right). */
  rotationDegrees?: number;
}

export type PageNumberFormat = "number" | "number-of-total";
export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export interface PageNumberOptions {
  format?: PageNumberFormat;
  position?: PageNumberPosition;
  /** First page's printed number. Default 1. */
  startAt?: number;
  fontSize?: number;
}

/**
 * Stamps semi-transparent diagonal watermark text onto every page. No-op if
 * `text` is blank. Coordinates are computed in each page's own (unrotated)
 * content space — a page rotated via Organize's rotate control will carry
 * the watermark along with it visually, since the /Rotate entry applies to
 * the whole page including this stamp.
 */
export async function addWatermark(doc: PDFDocument, options: WatermarkOptions): Promise<void> {
  const text = options.text.trim();
  if (!text) return;

  const { opacity = 0.3, rotationDegrees = 45 } = options;
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const angleRad = (rotationDegrees * Math.PI) / 180;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const size = options.fontSize ?? Math.min(width, height) / 8;
    const textWidth = font.widthOfTextAtSize(text, size);

    // Anchor so the text's horizontal midpoint lands at the page center once rotated.
    const x = width / 2 - (textWidth / 2) * Math.cos(angleRad);
    const y = height / 2 - (textWidth / 2) * Math.sin(angleRad);

    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotationDegrees),
    });
  }
}

/** Stamps a page-number label onto every page. */
export async function addPageNumbers(doc: PDFDocument, options: PageNumberOptions = {}): Promise<void> {
  const { format = "number-of-total", position = "bottom-center", startAt = 1, fontSize = 10 } = options;

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const margin = 24;

  pages.forEach((page, index) => {
    const pageNumber = startAt + index;
    const text = format === "number-of-total" ? `Page ${pageNumber} of ${total}` : `${pageNumber}`;
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const x =
      position.endsWith("center")
        ? width / 2 - textWidth / 2
        : position.endsWith("right")
          ? width - textWidth - margin
          : margin;
    const y = position.startsWith("top") ? height - margin : margin;

    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  });
}
