"use client";

import { ChevronLeft, ChevronRight, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { PenLine, Upload, MousePointerClick, Download } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfUploader } from "@/components/pdf-uploader";
import { SignaturePad } from "@/components/signature-pad";
import { SignaturePlacementPreview } from "@/components/signature-placement-preview";
import { PdfActionButton } from "@/components/pdf-action-button";
import { PdfResultPanel } from "@/components/pdf-result-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignPdf } from "@/hooks/use-sign-pdf";

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Upload a PDF",
    description: "Select the PDF you want to sign.",
  },
  {
    icon: PenLine,
    title: "2. Add your signature",
    description: "Draw it, or type your name in a signature-style font.",
  },
  {
    icon: MousePointerClick,
    title: "3. Place and download",
    description: "Click the page to position it, then download instantly.",
  },
];

export default function SignPage() {
  const {
    sourceFile,
    addFile,
    currentPageIndex,
    goToPage,
    pageImageUrl,
    isRenderingPage,
    setPageAspectRatio,
    signatureUrl,
    setSignatureBlob,
    placement,
    placeSignature,
    setSignatureWidthRatio,
    outputFilename,
    setOutputFilename,
    isSigning,
    result,
    sign,
    reset,
    canSign,
    buildOutputFilename,
  } = useSignPdf();

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
              Sign a PDF
            </h1>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Your files never leave your browser.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Adds a visual signature stamp to the page you choose — not a cryptographic digital
              signature.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-md">
            {result ? (
              <PdfResultPanel
                result={result}
                filename={buildOutputFilename()}
                description={`${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"} · signed successfully`}
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
                    helpText="Sign works on one PDF at a time"
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
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Previous page"
                        disabled={currentPageIndex === 0}
                        onClick={() => goToPage(currentPageIndex - 1)}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPageIndex + 1} of {sourceFile.pageCount}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Next page"
                        disabled={currentPageIndex === sourceFile.pageCount - 1}
                        onClick={() => goToPage(currentPageIndex + 1)}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>

                    <SignaturePlacementPreview
                      pageImageUrl={pageImageUrl}
                      isLoading={isRenderingPage}
                      signatureUrl={signatureUrl}
                      placement={placement}
                      onPageImageLoad={setPageAspectRatio}
                      onPlace={placeSignature}
                    />

                    {placement && (
                      <div className="space-y-1.5">
                        <Label htmlFor="signature-size">Signature size</Label>
                        <input
                          id="signature-size"
                          type="range"
                          min={0.1}
                          max={0.6}
                          step={0.01}
                          value={placement.widthRatio}
                          onChange={(event) => setSignatureWidthRatio(Number(event.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}

                    <SignaturePad onSignatureChange={setSignatureBlob} />

                    <div className="space-y-1.5">
                      <Label htmlFor="output-filename">Output filename</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="output-filename"
                          value={outputFilename}
                          onChange={(event) => setOutputFilename(event.target.value)}
                          placeholder="signed-document"
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <PdfActionButton
                        disabled={!canSign}
                        isBusy={isSigning}
                        icon={Download}
                        label="Sign PDF"
                        busyLabel="Signing..."
                        onClick={sign}
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
