export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB per file
export const MAX_COMBINED_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB combined
export const MAX_FILE_SIZE_LABEL = "200 MB";
export const MAX_COMBINED_SIZE_LABEL = "500 MB";

export const ACCEPTED_MIME_TYPES = ["application/pdf"];
export const ACCEPTED_EXTENSION = ".pdf";

export const DEFAULT_OUTPUT_FILENAME = "merged-document";

export const SITE_NAME = "PDF Merge";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pdfcraft.aakasa.dev";
