import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files Online | PDFCraft",
  description:
    "Combine multiple PDF files into one document quickly and securely. Rearrange PDFs, merge them instantly, and download the combined PDF.",
};

export default function MergeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
