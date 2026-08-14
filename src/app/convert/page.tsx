"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { RefreshCw, Upload, Image as ImageIcon, FileOutput } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfUploader } from "@/components/pdf-uploader";
import { AddMorePdfsButton } from "@/components/add-more-pdfs-button";
import { ImageFileList } from "@/components/image-file-list";
import { PdfSummary } from "@/components/pdf-summary";
import { PdfPageSelectGrid } from "@/components/pdf-page-select-grid";
import { PdfActionButton } from "@/components/pdf-action-button";
import { PdfResultPanel } from "@/components/pdf-result-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import { useImagesToPdf } from "@/hooks/use-images-to-pdf";
import { usePdfToImages, type ImageFormat } from "@/hooks/use-pdf-to-images";

const IMAGE_ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

type Direction = "images-to-pdf" | "pdf-to-images";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "images-to-pdf", label: "Images to PDF" },
  { value: "pdf-to-images", label: "PDF to Images" },
];

const FORMATS: { value: ImageFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Upload",
    description: "Select images to combine, or a PDF to convert.",
  },
  {
    icon: RefreshCw,
    title: "2. Choose options",
    description: "Reorder images, or pick pages and image format.",
  },
  {
    icon: FileOutput,
    title: "3. Convert and download",
    description: "Get your new file instantly.",
  },
];

export default function ConvertPage() {
  const [direction, setDirection] = useState<Direction>("images-to-pdf");
  const imagesToPdf = useImagesToPdf();
  const pdfToImages = usePdfToImages();

  const handleDirectionChange = (next: Direction) => {
    if (next === direction) return;
    imagesToPdf.reset();
    pdfToImages.reset();
    setDirection(next);
  };

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Convert images and PDFs
            </h1>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Your files never leave your browser.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl justify-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            {DIRECTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={direction === option.value}
                onClick={() => handleDirectionChange(option.value)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  direction === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-2xl">
            {direction === "images-to-pdf" ? (
              <ImagesToPdfPanel {...imagesToPdf} />
            ) : (
              <PdfToImagesPanel {...pdfToImages} />
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
                Your documents stay private. Processing happens directly inside your browser
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

function ImagesToPdfPanel({
  files,
  addFiles,
  removeFile,
  reorderFiles,
  totalSize,
  outputFilename,
  setOutputFilename,
  isConverting,
  result,
  convert,
  reset,
  canConvert,
  buildOutputName,
}: ReturnType<typeof useImagesToPdf>) {
  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = buildOutputName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (result) {
    return (
      <PdfResultPanel
        result={result}
        filename={buildOutputName()}
        description={`${result.pageCount} ${result.pageCount === 1 ? "image" : "images"} converted successfully`}
        downloadLabel="Download PDF"
        onDownload={handleDownload}
        onStartOver={reset}
      />
    );
  }

  if (files.length === 0) {
    return (
      <PdfUploader
        onFilesSelected={addFiles}
        accept={IMAGE_ACCEPT}
        title="Drop images here"
        helpText={`JPG or PNG · up to ${MAX_FILE_SIZE_LABEL} each`}
        ariaLabel="Upload images"
        buttonLabel="Select Images"
        rejectionMessage="is not a supported image file (JPG or PNG)."
      />
    );
  }

  return (
    <div className="space-y-6">
      <ImageFileList items={files} onReorder={reorderFiles} onRemove={removeFile} />

      <AddMorePdfsButton
        onFilesSelected={addFiles}
        accept={IMAGE_ACCEPT}
        label="Add More Images"
        ariaLabel="Add more images"
        rejectionMessage="is not a supported image file (JPG or PNG)."
      />

      <PdfSummary
        fileCount={files.length}
        totalPages={files.length}
        totalPagesLabel="Images"
        totalSize={totalSize}
      />

      <div className="space-y-1.5">
        <Label htmlFor="output-filename">Output filename</Label>
        <div className="flex items-center gap-2">
          <Input
            id="output-filename"
            value={outputFilename}
            onChange={(event) => setOutputFilename(event.target.value)}
            placeholder="converted-document"
          />
          <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
        </div>
      </div>

      <div className="space-y-2">
        <PdfActionButton
          disabled={!canConvert}
          isBusy={isConverting}
          icon={FileOutput}
          label="Convert to PDF"
          busyLabel="Converting..."
          onClick={convert}
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
  );
}

function PdfToImagesPanel({
  sourceFile,
  addFile,
  pages,
  togglePage,
  selectAll,
  selectNone,
  selectedCount,
  format,
  setFormat,
  outputFilename,
  setOutputFilename,
  isRenderingThumbnails,
  isConverting,
  result,
  convert,
  reset,
  canConvert,
  buildOutputName,
}: ReturnType<typeof usePdfToImages>) {
  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = buildOutputName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (result) {
    return (
      <PdfResultPanel
        result={result}
        filename={buildOutputName()}
        title={result.isZip ? "Your images are ready" : "Your image is ready"}
        description={
          result.isZip
            ? `${result.fileCount} images converted successfully`
            : "1 image converted successfully"
        }
        downloadLabel={result.isZip ? "Download ZIP" : "Download Image"}
        onDownload={handleDownload}
        onStartOver={reset}
      />
    );
  }

  if (!sourceFile) {
    return (
      <PdfUploader
        onFilesSelected={addFile}
        multiple={false}
        title="Drop a PDF here"
        helpText="Convert works on one PDF at a time"
      />
    );
  }

  if (sourceFile.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <TriangleAlert className="size-8 text-destructive" />
        <p className="text-sm text-destructive">{sourceFile.error}</p>
        <Button type="button" variant="outline" onClick={reset}>
          Try another file
        </Button>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Reading {sourceFile.name}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {FORMATS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={format === option.value}
            onClick={() => setFormat(option.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              format === option.value
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

      <div className="flex items-center justify-between">
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

      <div className="space-y-1.5">
        <Label htmlFor="output-filename">Output filename</Label>
        <div className="flex items-center gap-2">
          <Input
            id="output-filename"
            value={outputFilename}
            onChange={(event) => setOutputFilename(event.target.value)}
            placeholder="converted-document"
          />
          <span className="shrink-0 text-sm text-muted-foreground">
            .{format === "png" ? "png" : "jpg"} / .zip
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <PdfActionButton
          disabled={!canConvert}
          isBusy={isConverting}
          icon={ImageIcon}
          label="Convert to Images"
          busyLabel="Converting..."
          onClick={convert}
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
  );
}
