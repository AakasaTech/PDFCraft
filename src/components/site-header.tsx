"use client";

import Link from "next/link";
import { FileStack, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const TOOLS = [
  { label: "Merge PDF", href: "/merge" },
  { label: "Split PDF", href: "/split" },
  { label: "Compress PDF", href: "/compress" },
  { label: "Organize PDF", href: "/organize" },
  { label: "Convert PDF", href: "/convert" },
  { label: "Sign PDF", href: "/sign" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileStack className="size-4" />
          </div>
          <span className="text-lg font-semibold text-foreground">PDF Merge</span>
        </Link>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1">
                  PDF Tools
                  <ChevronDown className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>PDF Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TOOLS.map((tool) =>
                  tool.href ? (
                    <DropdownMenuItem key={tool.label} render={<Link href={tool.href}>{tool.label}</Link>} />
                  ) : (
                    <DropdownMenuItem key={tool.label} disabled>
                      {tool.label}
                      <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
