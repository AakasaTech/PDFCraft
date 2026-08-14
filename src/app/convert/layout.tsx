import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert PDF to Images or Images to PDF | PDF Merge",
  description:
    "Convert JPG or PNG images into a PDF, or export PDF pages as images. Entirely in your browser, download instantly.",
};

export default function ConvertLayout({ children }: { children: React.ReactNode }) {
  return children;
}
