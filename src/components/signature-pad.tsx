"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SignatureMode = "draw" | "type";

interface SignaturePadProps {
  onSignatureChange: (blob: Blob | null) => void;
}

const FONTS = [
  { label: "Elegant", family: "'Brush Script MT', 'Segoe Script', cursive" },
  { label: "Classic", family: "'Lucida Handwriting', 'Bradley Hand', cursive" },
];

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 180;

export function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const [mode, setMode] = useState<SignatureMode>("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const [typedName, setTypedName] = useState("");
  const [fontFamily, setFontFamily] = useState(FONTS[0].family);

  const getContext = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const emitSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInkRef.current) {
      onSignatureChange(null);
      return;
    }
    canvas.toBlob((blob) => onSignatureChange(blob), "image/png");
  }, [onSignatureChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
    onSignatureChange(null);
  }, [getContext, onSignatureChange]);

  const getPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const ctx = getContext();
      if (!ctx) return;
      drawingRef.current = true;
      const { x, y } = getPoint(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
    },
    [getContext, getPoint]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const ctx = getContext();
      if (!ctx) return;
      const { x, y } = getPoint(event);
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
      hasInkRef.current = true;
    },
    [getContext, getPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    emitSignature();
  }, [emitSignature]);

  // Type mode: re-render the name onto the canvas whenever the text or font changes.
  useEffect(() => {
    if (mode !== "type") return;
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const trimmed = typedName.trim();
    if (!trimmed) {
      hasInkRef.current = false;
      onSignatureChange(null);
      return;
    }

    ctx.fillStyle = "#111827";
    ctx.font = `56px ${fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.fillText(trimmed, 16, canvas.height / 2, canvas.width - 32);
    hasInkRef.current = true;
    canvas.toBlob((blob) => onSignatureChange(blob), "image/png");
  }, [mode, typedName, fontFamily, getContext, onSignatureChange]);

  const switchMode = useCallback(
    (next: SignatureMode) => {
      if (next === mode) return;
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInkRef.current = false;
      onSignatureChange(null);
      if (next === "draw") setTypedName("");
      setMode(next);
    },
    [mode, getContext, onSignatureChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {(["draw", "type"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => switchMode(option)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              mode === option
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {mode === "type" && (
        <div className="space-y-2">
          <Input
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            placeholder="Your name"
            aria-label="Your name"
          />
          <div className="flex gap-2">
            {FONTS.map((font) => (
              <button
                key={font.label}
                type="button"
                aria-pressed={fontFamily === font.family}
                onClick={() => setFontFamily(font.family)}
                style={{ fontFamily: font.family }}
                className={cn(
                  "rounded-md border px-3 py-1 text-lg",
                  fontFamily === font.family
                    ? "border-primary bg-primary/5"
                    : "border-border text-muted-foreground"
                )}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="overflow-hidden rounded-lg border-2 border-dashed border-border"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-muted) 0, var(--color-muted) 1px, transparent 1px, transparent 8px)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label={mode === "draw" ? "Draw your signature" : "Signature preview"}
          className="block w-full touch-none"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          onPointerDown={mode === "draw" ? handlePointerDown : undefined}
          onPointerMove={mode === "draw" ? handlePointerMove : undefined}
          onPointerUp={mode === "draw" ? handlePointerUp : undefined}
          onPointerLeave={mode === "draw" ? handlePointerUp : undefined}
        />
      </div>

      {mode === "draw" && (
        <Button type="button" variant="outline" size="sm" onClick={clearCanvas} className="gap-1.5">
          <Eraser className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
