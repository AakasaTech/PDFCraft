import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { buildZip } from "@/lib/zip-utils";

describe("buildZip", () => {
  it("bundles multiple entries into a zip that round-trips correctly", async () => {
    const entries = [
      { name: "a.pdf", bytes: new Uint8Array([1, 2, 3]) },
      { name: "b.pdf", bytes: new Uint8Array([4, 5, 6, 7]) },
    ];

    const blob = buildZip(entries);
    expect(blob.type).toBe("application/zip");

    const unzipped = unzipSync(new Uint8Array(await blob.arrayBuffer()));

    expect(Object.keys(unzipped).sort()).toEqual(["a.pdf", "b.pdf"]);
    expect(Array.from(unzipped["a.pdf"])).toEqual([1, 2, 3]);
    expect(Array.from(unzipped["b.pdf"])).toEqual([4, 5, 6, 7]);
  });

  it("produces an empty-but-valid zip for no entries", async () => {
    const blob = buildZip([]);
    const unzipped = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    expect(Object.keys(unzipped)).toHaveLength(0);
  });
});
