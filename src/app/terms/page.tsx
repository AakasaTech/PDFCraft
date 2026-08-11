import type { Metadata } from "next";
import { SimplePageLayout } from "@/components/simple-page-layout";

export const metadata: Metadata = { title: "Terms | PDF Merge" };

export default function TermsPage() {
  return (
    <SimplePageLayout title="Terms">
      <p>
        PDF Merge is provided as-is, without warranty of any kind. You are responsible for the
        documents you process using this tool.
      </p>
      <p>
        This page is a placeholder and will be updated with full terms of service.
      </p>
    </SimplePageLayout>
  );
}
