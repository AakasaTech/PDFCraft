"use client";

import { useEffect, useState } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Object URLs must be created AND revoked within the same effect run, not
  // via useMemo — useMemo has no cleanup slot, so React 18/19 Strict Mode's
  // dev-only mount→cleanup→remount cycle revokes a memoized URL without ever
  // recreating it, leaving a permanently broken blob: reference.
  useEffect(() => {
    if (!item || !open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- must pair with the cleanup below; see comment above
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(item.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item, open]);

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
