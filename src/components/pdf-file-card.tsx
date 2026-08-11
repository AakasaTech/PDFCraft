"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, Loader2, Trash2, TriangleAlert, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/file-utils";
import type { PdfFileItem } from "@/types/pdf";

interface PdfFileCardProps {
  item: PdfFileItem;
  index: number;
  onRemove: (id: string) => void;
  onPreview: (item: PdfFileItem) => void;
}

export function PdfFileCard({ item, index, onRemove, onPreview }: PdfFileCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm",
        isDragging && "z-10 opacity-70 shadow-md"
      )}
    >
      <button
        type="button"
        className="flex cursor-grab touch-none items-center justify-center rounded p-2 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label={`Reorder ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <FileText className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={item.name}>
          {index + 1}. {item.name}
        </p>
        {item.status === "ready" && (
          <p className="text-xs text-muted-foreground">
            {item.pageCount} {item.pageCount === 1 ? "page" : "pages"} &middot;{" "}
            {formatFileSize(item.size)}
          </p>
        )}
        {item.status === "processing" && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Reading PDF...
          </p>
        )}
        {item.status === "error" && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <TriangleAlert className="size-3" /> {item.error ?? "This file could not be read."}
          </p>
        )}
      </div>

      {item.status === "ready" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Preview ${item.name}`}
          onClick={() => onPreview(item)}
        >
          <Eye className="size-4" />
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        aria-label={`Remove ${item.name}`}
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
