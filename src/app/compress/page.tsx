"use client";

import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { FileArchive, Upload, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfUploader } from "@/components/pdf-uploader";
import { PdfActionButton } from "@/components/pdf-action-button";
import { PdfResultPanel } from "@/components/pdf-result-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/lib/file-utils";
import { useCompressPdf } from "@/hooks/use-compress-pdf";

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Upload a PDF",
    description: "Select the PDF you want to compress.",
  },
  {
    icon: Sparkles,
    title: "2. Compress",
    description: "Metadata is stripped and the file is re-optimized.",
  },
  {
    icon: FileArchive,
    title: "3. Download",
    description: "Get your smaller PDF instantly.",
  },
];

export default function CompressPage() {
  const {
    sourceFile,
    addFile,
    outputFilename,
    setOutputFilename,
    isCompressing,
    result,
    compress,
    reset,
    canCompress,
    buildOutputName,
  } = useCompressPdf();

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = buildOutputName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFile = !!sourceFile;

  const savedBytes = result ? result.originalSize - result.size : 0;
  const savedPercent = result && result.originalSize > 0 ? (savedBytes / result.originalSize) * 100 : 0;
  const resultDescription = result
    ? savedBytes > 0
      ? `${formatFileSize(result.originalSize)} → ${formatFileSize(result.size)} (${savedPercent.toFixed(0)}% smaller)`
      : "This PDF was already optimized — no significant size reduction"
    : "";

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Compress a PDF
            </h1>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Your files never leave your browser.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Lossless optimization only — strips metadata and compresses document structure.
              Savings vary; already-optimized PDFs may see little change.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            {result ? (
              <PdfResultPanel
                result={result}
                filename={buildOutputName()}
                description={resultDescription}
                showSize={false}
                downloadLabel="Download PDF"
                onDownload={handleDownload}
                onStartOver={reset}
              />
            ) : (
              <>
                {!hasFile && (
                  <PdfUploader
                    onFilesSelected={addFile}
                    multiple={false}
                    title="Drop a PDF here"
                    helpText="Compress works on one PDF at a time"
                  />
                )}

                {hasFile && sourceFile.status === "error" && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                    <TriangleAlert className="size-8 text-destructive" />
                    <p className="text-sm text-destructive">{sourceFile.error}</p>
                    <Button type="button" variant="outline" onClick={reset}>
                      Try another file
                    </Button>
                  </div>
                )}

                {hasFile && sourceFile.status === "processing" && (
                  <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                    <p className="text-sm">Reading {sourceFile.name}...</p>
                  </div>
                )}

                {hasFile && sourceFile.status === "ready" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {sourceFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sourceFile.pageCount} {sourceFile.pageCount === 1 ? "page" : "pages"}{" "}
                          &middot; {formatFileSize(sourceFile.size)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="output-filename">Output filename</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="output-filename"
                          value={outputFilename}
                          onChange={(event) => setOutputFilename(event.target.value)}
                          placeholder="compressed-document"
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <PdfActionButton
                        disabled={!canCompress}
                        isBusy={isCompressing}
                        icon={FileArchive}
                        label="Compress PDF"
                        busyLabel="Compressing..."
                        onClick={compress}
                      />
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
    </>
  );
}
