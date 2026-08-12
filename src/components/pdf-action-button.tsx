"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfActionButtonProps {
  disabled: boolean;
  isBusy: boolean;
  icon: LucideIcon;
  label: string;
  busyLabel: string;
  onClick: () => void;
}

/** Shared primary-CTA pattern for every tool: icon + label, spinner + busy label while processing. */
export function PdfActionButton({
  disabled,
  isBusy,
  icon: Icon,
  label,
  busyLabel,
  onClick,
}: PdfActionButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full gap-2 text-base"
      disabled={disabled}
      onClick={onClick}
    >
      {isBusy ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {busyLabel}
        </>
      ) : (
        <>
          <Icon className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
