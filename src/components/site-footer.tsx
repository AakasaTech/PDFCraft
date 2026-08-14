import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-medium text-foreground">PDFCraft</p>
            <p className="text-xs text-muted-foreground">
              Merge, organize, split, convert, compress & sign PDFs — free, fast, and private.
            </p>
          </div>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-border/50 pt-4 text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            Built by{" "}
            <a
              href="https://aakasa.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground"
            >
              Aakasa Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
