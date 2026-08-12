"use client";

import { CheckCircle2, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/file-utils";

interface PdfResultPanelProps {
  result: { size: number };
  filename: string;
  title?: string;
  description: string;
  downloadLabel?: string;
  onDownload: () => void;
  onStartOver: () => void;
}

/** Shared success panel: every tool ends with "here's your file(s), download or start over." */
export function PdfResultPanel({
  result,
  filename,
  title = "Your PDF is ready",
  description,
  downloadLabel = "Download PDF",
  onDownload,
  onStartOver,
}: PdfResultPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {description} &middot; {formatFileSize(result.size)}
        </p>
        <p className="truncate text-xs text-muted-foreground">{filename}</p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button type="button" size="lg" className="gap-2" onClick={onDownload}>
          <Download className="size-4" />
          {downloadLabel}
        </Button>
        <Button type="button" size="lg" variant="outline" className="gap-2" onClick={onStartOver}>
          <RotateCcw className="size-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
