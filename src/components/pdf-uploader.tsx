"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import { toast } from "sonner";

interface PdfUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  helpText?: string;
}

export function PdfUploader({
  onFilesSelected,
  multiple = true,
  title = "Drop PDF files here",
  helpText = `Supports multiple PDF files · up to ${MAX_FILE_SIZE_LABEL} each`,
}: PdfUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
      for (const rejection of rejections) {
        toast.error(`"${rejection.file.name}" is not a supported PDF file.`);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple,
  });

  return (
    <div
      {...getRootProps({
        role: "button",
        "aria-label": "Upload PDF files",
      })}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-14",
        isDragActive && "border-primary bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform",
          isDragActive && "scale-110"
        )}
      >
        <UploadCloud className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">or</p>
      </div>
      <Button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          open();
        }}
      >
        Select PDF Files
      </Button>
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
}
