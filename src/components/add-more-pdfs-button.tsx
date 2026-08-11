"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddMorePdfsButtonProps {
  onFilesSelected: (files: File[]) => void;
}

export function AddMorePdfsButton({ onFilesSelected }: AddMorePdfsButtonProps) {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps({
        role: "button",
        "aria-label": "Add more PDF files",
      })}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border p-3 transition-colors hover:border-primary/50",
        isDragActive && "border-primary bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      <Button type="button" variant="outline" size="sm" className="gap-1.5" tabIndex={-1}>
        <Plus className="size-3.5" />
        Add More PDFs
      </Button>
    </div>
  );
}
