"use client";

import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { LayoutGrid, Save, RotateCw, Upload } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfUploader } from "@/components/pdf-uploader";
import { PdfPageGrid } from "@/components/pdf-page-grid";
import { PdfActionButton } from "@/components/pdf-action-button";
import { PdfResultPanel } from "@/components/pdf-result-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrganizePdf } from "@/hooks/use-organize-pdf";

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Upload a PDF",
    description: "Select the PDF you want to organize.",
  },
  {
    icon: LayoutGrid,
    title: "2. Arrange pages",
    description: "Drag to reorder, rotate, or delete individual pages.",
  },
  {
    icon: Save,
    title: "3. Save and download",
    description: "Create the updated PDF and download it instantly.",
  },
];

export default function OrganizePage() {
  const {
    sourceFile,
    addFile,
    pages,
    reorderPages,
    rotateLeft,
    rotateRight,
    deletePage,
    outputFilename,
    setOutputFilename,
    watermarkText,
    setWatermarkText,
    addPageNumbersEnabled,
    setAddPageNumbersEnabled,
    isRenderingThumbnails,
    isSaving,
    result,
    organize,
    reset,
    canOrganize,
    buildOutputFilename,
  } = useOrganizePdf();

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = buildOutputFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFile = !!sourceFile;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Organize PDF pages
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
                filename={buildOutputFilename()}
                description={`${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"} saved successfully`}
                downloadLabel="Download PDF"
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
                    helpText="Organize works on one PDF at a time"
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
                      {isRenderingThumbnails && (
                        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" />
                          Rendering page previews...
                        </p>
                      )}
                      <PdfPageGrid
                        pages={pages}
                        onReorder={reorderPages}
                        onRotateLeft={rotateLeft}
                        onRotateRight={rotateRight}
                        onDelete={deletePage}
                      />

                      <div className="mx-auto max-w-2xl space-y-6">
                        <div className="space-y-4 rounded-lg border border-border p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="watermark-text">Watermark text (optional)</Label>
                            <Input
                              id="watermark-text"
                              value={watermarkText}
                              onChange={(event) => setWatermarkText(event.target.value)}
                              placeholder="e.g. CONFIDENTIAL"
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm text-foreground">
                            <Checkbox
                              checked={addPageNumbersEnabled}
                              onCheckedChange={(checked) => setAddPageNumbersEnabled(checked === true)}
                            />
                            Add page numbers
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="output-filename">Output filename</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="output-filename"
                              value={outputFilename}
                              onChange={(event) => setOutputFilename(event.target.value)}
                              placeholder="organized-document"
                            />
                            <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <PdfActionButton
                            disabled={!canOrganize}
                            isBusy={isSaving}
                            icon={RotateCw}
                            label="Save Changes"
                            busyLabel="Saving..."
                            onClick={organize}
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
