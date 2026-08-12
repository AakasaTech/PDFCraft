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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { PdfPageThumbnail } from "@/components/pdf-page-thumbnail";
import type { OrganizePageItem } from "@/types/pdf";

interface PdfPageGridProps {
  pages: OrganizePageItem[];
  onReorder: (pages: OrganizePageItem[]) => void;
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PdfPageGrid({
  pages,
  onReorder,
  onRotateLeft,
  onRotateRight,
  onDelete,
}: PdfPageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((page) => page.id === active.id);
    const newIndex = pages.findIndex((page) => page.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(pages, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map((page) => page.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {pages.map((page, index) => (
            <PdfPageThumbnail
              key={page.id}
              page={page}
              displayIndex={index}
              canDelete={pages.length > 1}
              onRotateLeft={onRotateLeft}
              onRotateRight={onRotateRight}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
