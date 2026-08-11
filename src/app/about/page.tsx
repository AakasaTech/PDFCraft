import type { Metadata } from "next";
import { SimplePageLayout } from "@/components/simple-page-layout";

export const metadata: Metadata = { title: "About | PDF Merge" };

export default function AboutPage() {
  return (
    <SimplePageLayout title="About">
      <p>
        PDF Merge is a simple, privacy-focused tool for combining PDF documents. It runs entirely
        in your browser, so your files never leave your device.
      </p>
    </SimplePageLayout>
  );
}
