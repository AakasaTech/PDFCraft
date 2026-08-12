export type PdfFileStatus = "processing" | "ready" | "error";

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  status: PdfFileStatus;
  error?: string;
}

/** Shared shape returned by every tool that produces a downloadable PDF (Merge, Organize, ...). */
export interface PdfBuildResult {
  blob: Blob;
  url: string;
  pageCount: number;
  size: number;
}

/** One page tile in the Organize page grid. */
export interface OrganizePageItem {
  /** Stable id for dnd-kit — distinct from sourceIndex so a duplicated page has its own identity. */
  id: string;
  /** 0-indexed page number in the original source document. */
  sourceIndex: number;
  /** Extra rotation (degrees) the user has applied on top of the page's original rotation. */
  rotation: 0 | 90 | 180 | 270;
  /** Data URL thumbnail, or null while still rendering. */
  thumbnailUrl: string | null;
}

/** One page tile in the Split "extract pages" grid. */
export interface SplitPageItem {
  id: string;
  /** 0-indexed page number in the original source document. */
  sourceIndex: number;
  selected: boolean;
  /** Data URL thumbnail, or null while still rendering. */
  thumbnailUrl: string | null;
}

/** Output of a Split operation — a single PDF (extract mode) or a zip of several (ranges mode). */
export interface SplitResult {
  blob: Blob;
  url: string;
  size: number;
  /** Number of PDF files produced (1 for extract/single-range, N when zipped). */
  fileCount: number;
  /** Page count of the single output PDF — only meaningful when fileCount === 1. */
  pageCount?: number;
  isZip: boolean;
}
