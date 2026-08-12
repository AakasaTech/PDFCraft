import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Files Online | PDF Merge",
  description:
    "Split a PDF into multiple files — extract selected pages or split by page ranges. Entirely in your browser, download instantly.",
};

export default function SplitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
