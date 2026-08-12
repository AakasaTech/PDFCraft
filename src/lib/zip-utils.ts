import { zipSync } from "fflate";

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

/** Bundles multiple files into a single downloadable zip Blob. */
export function buildZip(entries: ZipEntry[]): Blob {
  const zipInput: Record<string, Uint8Array> = {};
  for (const entry of entries) {
    zipInput[entry.name] = entry.bytes;
  }
  const zipped = zipSync(zipInput, { level: 6 });
  return new Blob([new Uint8Array(zipped)], { type: "application/zip" });
}
