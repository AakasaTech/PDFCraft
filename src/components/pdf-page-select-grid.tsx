"use client";

import { PdfPageSelectThumbnail } from "@/components/pdf-page-select-thumbnail";
import type { SplitPageItem } from "@/types/pdf";

interface PdfPageSelectGridProps {
  pages: SplitPageItem[];
  onToggle: (id: string) => void;
}

export function PdfPageSelectGrid({ pages, onToggle }: PdfPageSelectGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {pages.map((page, index) => (
        <PdfPageSelectThumbnail
          key={page.id}
          page={page}
          displayIndex={index}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
