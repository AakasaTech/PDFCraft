import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface SimplePageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function SimplePageLayout({ title, children }: SimplePageLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
