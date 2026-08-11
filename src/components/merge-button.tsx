"use client";

import { Loader2, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MergeButtonProps {
  disabled: boolean;
  isMerging: boolean;
  onClick: () => void;
}

export function MergeButton({ disabled, isMerging, onClick }: MergeButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full gap-2 text-base"
      disabled={disabled}
      onClick={onClick}
    >
      {isMerging ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Merging PDFs...
        </>
      ) : (
        <>
          <Merge className="size-4" />
          Merge PDFs
        </>
      )}
    </Button>
  );
}
