"use client";

import { useState } from "react";
import { ShieldCheck, Upload, ArrowDownWideNarrow, Combine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfUploader } from "@/components/pdf-uploader";
import { AddMorePdfsButton } from "@/components/add-more-pdfs-button";
import { PdfFileList } from "@/components/pdf-file-list";
import { PdfSummary } from "@/components/pdf-summary";
import { PdfPreview } from "@/components/pdf-preview";
import { MergeButton } from "@/components/merge-button";
import { MergeResultPanel } from "@/components/merge-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePdfMerger } from "@/hooks/use-pdf-merger";
import type { PdfFileItem } from "@/types/pdf";

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Upload PDFs",
    description: "Select the PDF files you want to combine.",
  },
  {
    icon: ArrowDownWideNarrow,
    title: "2. Arrange them",
    description: "Drag your documents into the correct order.",
  },
  {
    icon: Combine,
    title: "3. Merge and download",
    description: "Create one combined PDF and download it instantly.",
  },
];

export default function Home() {
  const {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    outputFilename,
    setOutputFilename,
    isMerging,
    mergeResult,
    merge,
    reset,
    totalPages,
    totalSize,
    canMerge,
    buildOutputFilename,
  } = usePdfMerger();

  const [previewItem, setPreviewItem] = useState<PdfFileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (item: PdfFileItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const handleDownload = () => {
    if (!mergeResult) return;
    const link = document.createElement("a");
    link.href = mergeResult.url;
    link.download = buildOutputFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFiles = files.length > 0;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Merge PDF files quickly and securely
            </h1>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Your files never leave your browser.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl space-y-6">
            {mergeResult ? (
              <MergeResultPanel
                result={mergeResult}
                filename={buildOutputFilename()}
                onDownload={handleDownload}
                onStartOver={reset}
              />
            ) : (
              <>
                {!hasFiles && <PdfUploader onFilesSelected={addFiles} />}

                {hasFiles && (
                  <div className="space-y-6">
                    <PdfFileList
                      items={files}
                      onReorder={reorderFiles}
                      onRemove={removeFile}
                      onPreview={handlePreview}
                    />

                    <AddMorePdfsButton onFilesSelected={addFiles} />

                    <PdfSummary
                      fileCount={files.length}
                      totalPages={totalPages}
                      totalSize={totalSize}
                    />

                    <div className="space-y-1.5">
                      <Label htmlFor="output-filename">Output filename</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="output-filename"
                          value={outputFilename}
                          onChange={(event) => setOutputFilename(event.target.value)}
                          placeholder="merged-document"
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <MergeButton disabled={!canMerge} isMerging={isMerging} onClick={merge} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={reset}
                      >
                        Start Over
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
            <h2 className="text-center text-xl font-semibold text-foreground">How it works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-border bg-card p-6 text-center shadow-sm">
              <h2 className="text-base font-semibold text-foreground">Privacy</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your documents stay private. PDF processing happens directly inside your browser
                whenever possible, meaning your files are never uploaded or stored on our
                servers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />

      <PdfPreview item={previewItem} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  );
}
