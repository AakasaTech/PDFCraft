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

export interface MergeResult {
  blob: Blob;
  url: string;
  pageCount: number;
  size: number;
}
