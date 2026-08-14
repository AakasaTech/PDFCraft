export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB per file
export const MAX_COMBINED_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB combined
export const MAX_FILE_SIZE_LABEL = "200 MB";
export const MAX_COMBINED_SIZE_LABEL = "500 MB";

export const ACCEPTED_MIME_TYPES = ["application/pdf"];
export const ACCEPTED_EXTENSION = ".pdf";

export const ACCEPTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"];
export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export const DEFAULT_OUTPUT_FILENAME = "merged-document";
export const DEFAULT_ORGANIZE_FILENAME = "organized-document";
export const DEFAULT_SPLIT_FILENAME = "split-document";
export const DEFAULT_CONVERT_FILENAME = "converted-document";
export const DEFAULT_COMPRESS_FILENAME = "compressed-document";
export const DEFAULT_SIGN_FILENAME = "signed-document";

export const SITE_NAME = "PDF Merge";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pdfcraft.aakasa.dev";
