import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
        <div>
          <p className="text-sm font-medium text-foreground">PDF Merge</p>
          <p className="text-xs text-muted-foreground">
            Merge PDF documents quickly, privately, and securely.
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
    </footer>
  );
}
