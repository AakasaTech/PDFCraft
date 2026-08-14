import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Files Online | PDF Merge",
  description:
    "Reduce PDF file size with lossless optimization — strips metadata and compresses document structure, entirely in your browser.",
};

export default function CompressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
