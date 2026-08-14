import { inflateSync } from "node:zlib";

function hexEncodeLatin1(text: string): string {
  return Array.from(text)
    .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Best-effort check that literal text was drawn somewhere in a saved PDF's
 * content streams — pdf-lib encodes drawText() strings as PDF hex strings
 * (`<...>`), so this inflates each Flate-compressed stream and looks for the
 * hex-encoded form; only ASCII/WinAnsi-safe text is supported.
 */
export function pdfContainsDrawnText(bytes: Uint8Array, text: string): boolean {
  const buf = Buffer.from(bytes);
  const hexNeedle = hexEncodeLatin1(text);
  let searchFrom = 0;

  for (;;) {
    const streamIdx = buf.indexOf("stream", searchFrom);
    if (streamIdx === -1) return false;

    let dataStart = streamIdx + "stream".length;
    if (buf[dataStart] === 0x0d) dataStart += 1;
    if (buf[dataStart] === 0x0a) dataStart += 1;

    const endIdx = buf.indexOf("endstream", dataStart);
    if (endIdx === -1) return false;

    const chunk = buf.subarray(dataStart, endIdx);
    try {
      const inflated = inflateSync(chunk).toString("latin1").toUpperCase();
      if (inflated.includes(hexNeedle)) return true;
    } catch {
      if (chunk.toString("latin1").includes(text)) return true;
    }

    searchFrom = endIdx + "endstream".length;
  }
}
