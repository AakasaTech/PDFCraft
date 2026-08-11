import {
  ACCEPTED_MIME_TYPES,
  MAX_COMBINED_SIZE_BYTES,
  MAX_COMBINED_SIZE_LABEL,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function isPdfFile(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  // Some browsers/OSes fail to set a MIME type for PDFs; fall back to extension.
  return file.name.toLowerCase().endsWith(".pdf");
}

export function validateFileType(file: File): ValidationResult {
  if (!isPdfFile(file)) {
    return { valid: false, error: "Only PDF files are supported." };
  }
  return { valid: true };
}

export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the maximum file size of ${MAX_FILE_SIZE_LABEL}.`,
    };
  }
  return { valid: true };
}

export function validateCombinedSize(totalBytes: number): ValidationResult {
  if (totalBytes > MAX_COMBINED_SIZE_BYTES) {
    return {
      valid: false,
      error: `Combined file size exceeds the maximum of ${MAX_COMBINED_SIZE_LABEL}.`,
    };
  }
  return { valid: true };
}
