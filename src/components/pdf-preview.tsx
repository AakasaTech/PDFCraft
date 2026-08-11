"use client";

import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/file-utils";
import type { PdfFileItem } from "@/types/pdf";

interface PdfPreviewProps {
  item: PdfFileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfPreview({ item, open, onOpenChange }: PdfPreviewProps) {
  const previewUrl = useMemo(() => {
    if (!item || !open) return null;
    return URL.createObjectURL(item.file);
  }, [item, open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">{item?.name}</DialogTitle>
          <DialogDescription>
            {item ? `${item.pageCount} ${item.pageCount === 1 ? "page" : "pages"} · ${formatFileSize(item.size)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-muted">
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=0`}
              title={item?.name ?? "PDF preview"}
              className="size-full"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Preview unavailable for this file.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
