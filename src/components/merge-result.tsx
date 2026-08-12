"use client";

import { PdfResultPanel } from "@/components/pdf-result-panel";
import type { PdfBuildResult } from "@/types/pdf";

interface MergeResultPanelProps {
  result: PdfBuildResult;
  filename: string;
  onDownload: () => void;
  onStartOver: () => void;
}

export function MergeResultPanel({
  result,
  filename,
  onDownload,
  onStartOver,
}: MergeResultPanelProps) {
  return (
    <PdfResultPanel
      result={result}
      filename={filename}
      description={`${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"} merged successfully`}
      downloadLabel="Download Merged PDF"
      onDownload={onDownload}
      onStartOver={onStartOver}
    />
  );
}
