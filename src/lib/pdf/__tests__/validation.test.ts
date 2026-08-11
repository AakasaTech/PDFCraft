import { describe, expect, it } from "vitest";
import {
  validateCombinedSize,
  validateFileSize,
  validateFileType,
} from "@/lib/pdf/validation";
import { MAX_COMBINED_SIZE_BYTES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { createNonPdfFile, createTestPdfFile } from "@/test/create-test-pdf";

describe("validateFileType", () => {
  it("accepts PDF files", async () => {
    const file = await createTestPdfFile("doc.pdf");
    expect(validateFileType(file).valid).toBe(true);
  });

  it("rejects non-PDF files", () => {
    const file = createNonPdfFile("doc.txt");
    const result = validateFileType(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/only pdf files/i);
  });
});

describe("validateFileSize", () => {
  it("accepts files within the size limit", () => {
    const file = new File([new Uint8Array(1024)], "small.pdf", { type: "application/pdf" });
    expect(validateFileSize(file).valid).toBe(true);
  });

  it("rejects files over the size limit", () => {
    const file = new File([new Uint8Array(MAX_FILE_SIZE_BYTES + 1)], "big.pdf", {
      type: "application/pdf",
    });
    expect(validateFileSize(file).valid).toBe(false);
  });
});

describe("validateCombinedSize", () => {
  it("accepts totals within the combined limit", () => {
    expect(validateCombinedSize(1024).valid).toBe(true);
  });

  it("rejects totals over the combined limit", () => {
    expect(validateCombinedSize(MAX_COMBINED_SIZE_BYTES + 1).valid).toBe(false);
  });
});
