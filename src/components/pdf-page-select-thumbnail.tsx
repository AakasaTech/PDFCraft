"use client";

import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SelectablePageItem } from "@/types/pdf";

interface PdfPageSelectThumbnailProps {
  page: SelectablePageItem;
  displayIndex: number;
  onToggle: (id: string) => void;
}

export function PdfPageSelectThumbnail({
  page,
  displayIndex,
  onToggle,
}: PdfPageSelectThumbnailProps) {
  return (
    <button
      type="button"
      aria-pressed={page.selected}
      aria-label={`${page.selected ? "Deselect" : "Select"} page ${displayIndex + 1}`}
      onClick={() => onToggle(page.id)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        page.selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2 py-1">
        <span className="text-xs font-medium text-muted-foreground">{displayIndex + 1}</span>
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-sm border",
            page.selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-background"
          )}
        >
          {page.selected && <Check className="size-3" />}
        </span>
      </div>

      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted/20 p-3">
        {page.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL, not an optimizable static/remote asset
          <img
            src={page.thumbnailUrl}
            alt={`Page ${displayIndex + 1} preview`}
            className="max-h-full max-w-full object-contain shadow-sm"
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
    </button>
  );
}
