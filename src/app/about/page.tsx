import type { Metadata } from "next";
import { SimplePageLayout } from "@/components/simple-page-layout";

export const metadata: Metadata = { title: "About | PDFCraft" };

export default function AboutPage() {
  return (
    <SimplePageLayout title="About">
      <p>
        PDFCraft is a simple, privacy-focused suite of PDF tools — merge, organize, split,
        convert, compress, and sign. It runs entirely in your browser, so your files never leave
        your device.
      </p>
    </SimplePageLayout>
  );
}
