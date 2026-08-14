"use client";

import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CenterPlacement } from "@/lib/pdf/sign-pdf";

interface SignaturePlacementPreviewProps {
  pageImageUrl: string | null;
  isLoading: boolean;
  signatureUrl: string | null;
  placement: CenterPlacement | null;
  onPageImageLoad: (aspectRatio: number) => void;
  onPlace: (xRatioCenter: number, yRatioCenterFromTop: number) => void;
}

export function SignaturePlacementPreview({
  pageImageUrl,
  isLoading,
  signatureUrl,
  placement,
  onPageImageLoad,
  onPlace,
}: SignaturePlacementPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!signatureUrl) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;
    onPlace(Math.min(Math.max(xRatio, 0), 1), Math.min(Math.max(yRatio, 0), 1));
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role={signatureUrl ? "button" : undefined}
      aria-label={signatureUrl ? "Click to place your signature on this page" : undefined}
      className={cn(
        "relative mx-auto w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted/20",
        signatureUrl && "cursor-crosshair"
      )}
    >
      {isLoading || !pageImageUrl ? (
        <div className="flex aspect-[3/4] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL, not an optimizable static/remote asset
        <img
          src={pageImageUrl}
          alt="Selected page preview"
          className="block w-full select-none"
          draggable={false}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalHeight > 0) onPageImageLoad(naturalWidth / naturalHeight);
          }}
        />
      )}

      {signatureUrl && placement && (
        // eslint-disable-next-line @next/next/no-img-element -- client-generated object URL, not an optimizable static/remote asset
        <img
          src={signatureUrl}
          alt="Signature placement preview"
          draggable={false}
          className="pointer-events-none absolute select-none drop-shadow-md"
          style={{
            left: `${placement.xRatioCenter * 100}%`,
            top: `${placement.yRatioCenterFromTop * 100}%`,
            width: `${placement.widthRatio * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {signatureUrl && !placement && !isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 p-4 text-center text-sm text-muted-foreground">
          Click on the page to place your signature
        </div>
      )}
    </div>
  );
}
