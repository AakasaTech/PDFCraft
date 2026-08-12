"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OrganizePageItem } from "@/types/pdf";

interface PdfPageThumbnailProps {
  page: OrganizePageItem;
  displayIndex: number;
  canDelete: boolean;
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PdfPageThumbnail({
  page,
  displayIndex,
  canDelete,
  onRotateLeft,
  onRotateRight,
  onDelete,
}: PdfPageThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        isDragging && "z-10 opacity-70 shadow-md"
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2 py-1">
        <button
          type="button"
          className="flex cursor-grab touch-none items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Reorder page ${displayIndex + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="text-xs font-medium text-muted-foreground">{displayIndex + 1}</span>
      </div>

      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted/20 p-3">
        {page.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL, not an optimizable static/remote asset
          <img
            src={page.thumbnailUrl}
            alt={`Page ${displayIndex + 1} preview`}
            className="max-h-full max-w-full object-contain shadow-sm transition-transform"
            style={{ transform: `rotate(${page.rotation}deg)` }}
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>

      <div className="flex items-center justify-center gap-1 border-t border-border bg-muted/30 p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Rotate page ${displayIndex + 1} left`}
          onClick={() => onRotateLeft(page.id)}
        >
          <RotateCcw className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Rotate page ${displayIndex + 1} right`}
          onClick={() => onRotateRight(page.id)}
        >
          <RotateCw className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Delete page ${displayIndex + 1}`}
          disabled={!canDelete}
          onClick={() => onDelete(page.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
