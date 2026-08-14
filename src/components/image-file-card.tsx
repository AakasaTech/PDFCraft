"use client";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/file-utils";
import type { ImageFileItem } from "@/types/pdf";

interface ImageFileCardProps {
  item: ImageFileItem;
  index: number;
  onRemove: (id: string) => void;
}

export function ImageFileCard({ item, index, onRemove }: ImageFileCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Object URLs must be created AND revoked within the same effect run, not
  // via useMemo — useMemo has no cleanup slot, so React 18/19 Strict Mode's
  // dev-only mount→cleanup→remount cycle revokes a memoized URL without ever
  // recreating it, leaving a permanently broken blob: reference.
  useEffect(() => {
    const url = URL.createObjectURL(item.file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must pair with the cleanup below; see comment above
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item.file]);

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

      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-generated object URL, not an optimizable static/remote asset
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <Skeleton className="size-full" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={item.name}>
          {index + 1}. {item.name}
        </p>
        {item.status === "ready" && (
          <p className="text-xs text-muted-foreground">
            {item.width}&times;{item.height} &middot; {formatFileSize(item.size)}
          </p>
        )}
        {item.status === "processing" && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Reading image...
          </p>
        )}
        {item.status === "error" && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <TriangleAlert className="size-3" /> {item.error ?? "This file could not be read."}
          </p>
        )}
      </div>

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
