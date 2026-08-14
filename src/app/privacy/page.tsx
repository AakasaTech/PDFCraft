import type { Metadata } from "next";
import { SimplePageLayout } from "@/components/simple-page-layout";

export const metadata: Metadata = { title: "Privacy | PDFCraft" };

export default function PrivacyPage() {
  return (
    <SimplePageLayout title="Privacy">
      <p>
        PDFCraft processes your documents entirely inside your browser. Your files are never
        uploaded to our servers, stored, or transmitted to third parties.
      </p>
      <p>
        We do not log file contents, and file names are never sent to analytics services.
      </p>
    </SimplePageLayout>
  );
}
