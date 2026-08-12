export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const formatted = exponent === 0 ? value.toString() : value.toFixed(1);
  return `${formatted} ${units[exponent]}`;
}

export function sanitizeFilename(name: string): string {
  const trimmed = name.trim();
  const sanitized = trimmed.replace(/[\\/:*?"<>|\x00-\x1f]/g, "-").replace(/-+/g, "-");
  return sanitized.length > 0 ? sanitized : "merged-document";
}

export function ensurePdfExtension(name: string): string {
  return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
}

export function stripPdfExtension(name: string): string {
  return name.toLowerCase().endsWith(".pdf") ? name.slice(0, -4) : name;
}

export function buildOutputFilename(name: string): string {
  return ensurePdfExtension(sanitizeFilename(name));
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
