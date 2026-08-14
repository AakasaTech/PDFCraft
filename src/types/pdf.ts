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

/** One page tile in a checkbox page-picker grid (Split's extract mode, Convert's PDF→Images). */
export interface SelectablePageItem {
  id: string;
  /** 0-indexed page number in the original source document. */
  sourceIndex: number;
  selected: boolean;
  /** Data URL thumbnail, or null while still rendering. */
  thumbnailUrl: string | null;
}

/**
 * Output of an operation that may produce either a single file or several
 * (Split's ranges mode, Convert's PDF→Images) — several are bundled into a
 * zip for download.
 */
export interface MultiFileResult {
  blob: Blob;
  url: string;
  size: number;
  /** Number of files produced (1 for a single output, N when zipped). */
  fileCount: number;
  /** Page count of the single output PDF — only set when fileCount === 1 and the output is a PDF. */
  pageCount?: number;
  isZip: boolean;
}

/** Image file selected for the Convert tool's Images → PDF direction. */
export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: PdfFileStatus;
  error?: string;
  width?: number;
  height?: number;
}
