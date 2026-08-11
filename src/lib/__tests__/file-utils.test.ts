import { describe, expect, it } from "vitest";
import {
  buildOutputFilename,
  ensurePdfExtension,
  formatFileSize,
  sanitizeFilename,
} from "@/lib/file-utils";

describe("formatFileSize", () => {
  it("formats bytes, KB, and MB", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});

describe("sanitizeFilename", () => {
  it("strips invalid filename characters", () => {
    expect(sanitizeFilename('inv:alid/name?.pdf')).toBe("inv-alid-name-.pdf");
  });

  it("falls back to a default name when empty", () => {
    expect(sanitizeFilename("   ")).toBe("merged-document");
  });
});

describe("ensurePdfExtension", () => {
  it("appends .pdf when missing", () => {
    expect(ensurePdfExtension("report")).toBe("report.pdf");
  });

  it("does not duplicate the extension", () => {
    expect(ensurePdfExtension("report.pdf")).toBe("report.pdf");
  });
});

describe("buildOutputFilename", () => {
  it("sanitizes and appends the extension", () => {
    expect(buildOutputFilename("my report")).toBe("my report.pdf");
    expect(buildOutputFilename("bad:name")).toBe("bad-name.pdf");
  });
});
