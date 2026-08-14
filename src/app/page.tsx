import Link from "next/link";
import { ShieldCheck, Upload, MousePointerClick, Download } from "lucide-react";
import { Combine, LayoutGrid, Scissors, RefreshCw, FileArchive, PenLine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const TOOLS = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    href: "/merge",
    icon: Combine,
  },
  {
    name: "Organize PDF",
    description: "Reorder, rotate, and delete pages",
    href: "/organize",
    icon: LayoutGrid,
  },
  {
    name: "Split PDF",
    description: "Extract pages or split into several files",
    href: "/split",
    icon: Scissors,
  },
  {
    name: "Convert PDF",
    description: "Images to PDF, or PDF pages to images",
    href: "/convert",
    icon: RefreshCw,
  },
  {
    name: "Compress PDF",
    description: "Reduce file size, losslessly",
    href: "/compress",
    icon: FileArchive,
  },
  {
    name: "Sign PDF",
    description: "Draw or type a signature and place it",
    href: "/sign",
    icon: PenLine,
  },
];

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "1. Choose a tool",
    description: "Pick the PDF tool you need from the options above.",
  },
  {
    icon: MousePointerClick,
    title: "2. Upload & customize",
    description: "Add your files and adjust the result to your liking.",
  },
  {
    icon: Download,
    title: "3. Download",
    description: "Get your finished PDF instantly.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              All the PDF tools you need
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Merge, organize, split, convert, compress, and sign PDFs — free, fast, and private.
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Your files never leave your browser.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <tool.icon className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </Link>
            ))}
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
