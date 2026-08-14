import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign a PDF Online | PDFCraft",
  description:
    "Add a signature to a PDF — draw or type it, then place it on the page. Entirely in your browser, download instantly.",
};

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
