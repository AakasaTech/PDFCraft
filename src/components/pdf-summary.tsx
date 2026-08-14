import { formatFileSize } from "@/lib/file-utils";

interface PdfSummaryProps {
  fileCount: number;
  totalPages: number;
  totalPagesLabel?: string;
  totalSize: number;
}

export function PdfSummary({
  fileCount,
  totalPages,
  totalPagesLabel = "Total pages",
  totalSize,
}: PdfSummaryProps) {
  const stats = [
    { label: "Files", value: fileCount },
    { label: totalPagesLabel, value: totalPages },
    { label: "Total size", value: formatFileSize(totalSize) },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-lg font-semibold text-foreground sm:text-xl">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
