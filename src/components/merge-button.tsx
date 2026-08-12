"use client";

import { Merge } from "lucide-react";
import { PdfActionButton } from "@/components/pdf-action-button";

interface MergeButtonProps {
  disabled: boolean;
  isMerging: boolean;
  onClick: () => void;
}

export function MergeButton({ disabled, isMerging, onClick }: MergeButtonProps) {
  return (
    <PdfActionButton
      disabled={disabled}
      isBusy={isMerging}
      icon={Merge}
      label="Merge PDFs"
      busyLabel="Merging PDFs..."
      onClick={onClick}
    />
  );
}
