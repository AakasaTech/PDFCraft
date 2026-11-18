"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowUpDown } from "lucide-react";
import { PdfFileCard } from "@/components/pdf-file-card";
import { Button } from "@/components/ui/button";
import type { PdfFileItem } from "@/types/pdf";

interface PdfFileListProps {
  items: PdfFileItem[];
  onReorder: (items: PdfFileItem[]) => void;
  onRemove: (id: string) => void;
  onPreview: (item: PdfFileItem) => void;
}

export function PdfFileList({ items, onReorder, onRemove, onPreview }: PdfFileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Drag files to arrange the order in which they will appear in the merged PDF.
        </p>
        {items.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => onReorder([...items].reverse())}
          >
            <ArrowUpDown className="size-4" />
            Reverse order
          </Button>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <PdfFileCard
                key={item.id}
                item={item}
                index={index}
                onRemove={onRemove}
                onPreview={onPreview}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
