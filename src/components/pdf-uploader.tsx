"use client";

import { useCallback } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import { toast } from "sonner";

const PDF_ACCEPT: Accept = { "application/pdf": [".pdf"] };

interface PdfUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  helpText?: string;
  accept?: Accept;
  ariaLabel?: string;
  buttonLabel?: string;
  rejectionMessage?: string;
}

export function PdfUploader({
  onFilesSelected,
  multiple = true,
  title = "Drop PDF files here",
  helpText = `Supports multiple PDF files · up to ${MAX_FILE_SIZE_LABEL} each`,
  accept = PDF_ACCEPT,
  ariaLabel = "Upload PDF files",
  buttonLabel = "Select PDF Files",
  rejectionMessage = "is not a supported PDF file.",
}: PdfUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
      for (const rejection of rejections) {
        toast.error(`"${rejection.file.name}" ${rejectionMessage}`);
      }
    },
    [onFilesSelected, rejectionMessage]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps({
        role: "button",
        "aria-label": ariaLabel,
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
        {buttonLabel}
      </Button>
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
}
