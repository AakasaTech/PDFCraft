"use client";

import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { Scissors, Upload, ListChecks } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfUploader } from "@/components/pdf-uploader";
import { PdfPageSelectGrid } from "@/components/pdf-page-select-grid";
import { PdfActionButton } from "@/components/pdf-action-button";
import { PdfResultPanel } from "@/components/pdf-result-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSplitPdf, type SplitMode } from "@/hooks/use-split-pdf";

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Upload a PDF",
    description: "Select the PDF you want to split.",
  },
  {
    icon: ListChecks,
    title: "2. Choose pages",
    description: "Select individual pages, or enter page ranges.",
  },
  {
    icon: Scissors,
    title: "3. Split and download",
    description: "Get one PDF, or a zip of several, instantly.",
  },
];

const MODES: { value: SplitMode; label: string }[] = [
  { value: "extract", label: "Select Pages" },
  { value: "ranges", label: "Page Ranges" },
];

export default function SplitPage() {
  const {
    sourceFile,
    addFile,
    pages,
    togglePage,
    selectAll,
    selectNone,
    selectedCount,
    mode,
    setMode,
    rangesInput,
    setRangesInput,
    outputFilename,
    setOutputFilename,
    isRenderingThumbnails,
    isSaving,
    result,
    split,
    reset,
    canSplit,
    buildOutputName,
  } = useSplitPdf();

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

  const resultDescription = result
    ? result.isZip
      ? `${result.fileCount} ${result.fileCount === 1 ? "file" : "files"} created`
      : `${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"} extracted successfully`
    : "";

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Split a PDF into multiple files
            </h1>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Your files never leave your browser.
            </p>
          </div>

          {result ? (
            <div className="mx-auto mt-8 max-w-2xl">
              <PdfResultPanel
                result={result}
                filename={buildOutputName()}
                title={result.isZip ? "Your files are ready" : "Your PDF is ready"}
                description={resultDescription}
                downloadLabel={result.isZip ? "Download ZIP" : "Download PDF"}
                onDownload={handleDownload}
                onStartOver={reset}
              />
            </div>
          ) : (
            <>
              {!hasFile && (
                <div className="mx-auto mt-8 max-w-2xl">
                  <PdfUploader
                    onFilesSelected={addFile}
                    multiple={false}
                    title="Drop a PDF here"
                    helpText="Split works on one PDF at a time"
                  />
                </div>
              )}

              {hasFile && sourceFile.status === "error" && (
                <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                  <TriangleAlert className="size-8 text-destructive" />
                  <p className="text-sm text-destructive">{sourceFile.error}</p>
                  <Button type="button" variant="outline" onClick={reset}>
                    Try another file
                  </Button>
                </div>
              )}

              {hasFile && sourceFile.status !== "error" && (
                <div className="mt-8 space-y-6">
                  {pages.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin" />
                      <p className="text-sm">Reading {sourceFile.name}...</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto flex max-w-2xl justify-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                        {MODES.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={mode === option.value}
                            onClick={() => setMode(option.value)}
                            className={cn(
                              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                              mode === option.value
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {isRenderingThumbnails && (
                        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" />
                          Rendering page previews...
                        </p>
                      )}

                      {mode === "extract" ? (
                        <>
                          <div className="mx-auto flex max-w-2xl items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              {selectedCount} of {pages.length} pages selected
                            </p>
                            <div className="flex gap-2">
                              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                                Select All
                              </Button>
                              <Button type="button" variant="ghost" size="sm" onClick={selectNone}>
                                Select None
                              </Button>
                            </div>
                          </div>
                          <PdfPageSelectGrid pages={pages} onToggle={togglePage} />
                        </>
                      ) : (
                        <div className="mx-auto max-w-2xl space-y-1.5">
                          <Label htmlFor="page-ranges">Page ranges</Label>
                          <Input
                            id="page-ranges"
                            value={rangesInput}
                            onChange={(event) => setRangesInput(event.target.value)}
                            placeholder="e.g. 1-3, 4-6, 8"
                          />
                          <p className="text-xs text-muted-foreground">
                            This PDF has {pages.length} {pages.length === 1 ? "page" : "pages"}.
                            Each range becomes its own PDF; multiple ranges download as a zip.
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() =>
                              setRangesInput(
                                Array.from({ length: pages.length }, (_, i) => i + 1).join(", ")
                              )
                            }
                          >
                            Split every page into its own PDF
                          </Button>
                        </div>
                      )}

                      <div className="mx-auto max-w-2xl space-y-6">
                        <div className="space-y-1.5">
                          <Label htmlFor="output-filename">Output filename</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="output-filename"
                              value={outputFilename}
                              onChange={(event) => setOutputFilename(event.target.value)}
                              placeholder="split-document"
                            />
                            <span className="shrink-0 text-sm text-muted-foreground">
                              .pdf / .zip
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <PdfActionButton
                            disabled={!canSplit}
                            isBusy={isSaving}
                            icon={Scissors}
                            label={mode === "extract" ? "Extract Pages" : "Split PDF"}
                            busyLabel="Splitting..."
                            onClick={split}
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
                    </>
                  )}
                </div>
              )}
            </>
          )}
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
