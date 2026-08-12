import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organize PDF Pages | PDF Merge",
  description:
    "Reorder, rotate, or delete pages in a PDF — entirely in your browser. Drag pages into place and download the updated document instantly.",
};

export default function OrganizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
