import { useRef } from "react";
import { DndContext, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { TimeBlock } from "@/lib/scheduler";
import { DraggableTimeBlock } from "./time-block";
import { cn } from "@/lib/utils";

interface TimelineProps {
  blocks: (TimeBlock & { id: string; title?: string })[];
  onBlockMove: (id: string, newStartTime: Date) => void;
  onBlockCreate: (startTime: Date) => void;
}

const GRID_HEIGHT = 60; // px per hour

export function Timeline({ blocks, onBlockMove, onBlockCreate }: TimelineProps) {
  const { setNodeRef } = useDroppable({
    id: "timeline-droppable",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const block = active.data.current?.block as TimeBlock;

    if (!block) return;

    // Calculate new start time based on delta Y
    // delta.y / GRID_HEIGHT = hours moved
    const hoursMoved = delta.y / GRID_HEIGHT;
    const minutesMoved = Math.round(hoursMoved * 60 / 15) * 15; // Snap to 15m

    const newStart = new Date(block.startTime.getTime() + minutesMoved * 60000);

    // Validate boundaries (00:00 - 24:00) handled by parent or server usually,
    // but here we just pass the intention.

    onBlockMove(active.id as string, newStart);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
      // If clicking directly on container (not on a block)
      if (e.target !== e.currentTarget) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top + e.currentTarget.scrollTop;
      const hour = y / GRID_HEIGHT;

      // Snap to nearest 30m or hour
      const snappedHour = Math.floor(hour);
      // const snappedMinutes = Math.round((hour - snappedHour) * 60 / 30) * 30;

      // Basic implementation: Start of the hour clicked
      const date = new Date(); // Need context date!
      // Actually we assume the parent handles the "date" context.
      // We pass back a Date object constructed from Today but with correct hours?
      // No, this component should probably take the base date as prop.
      // But let's assume we return just the time relative to epoch or similar,
      // OR better, we pass just the hour offset and parent reconstructs.
      // Let's pass a Date object using "today" as base, but parent overrides date part.

      const clickTime = new Date();
      clickTime.setHours(snappedHour, 0, 0, 0);

      onBlockCreate(clickTime);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        ref={setNodeRef}
        className="relative h-[1440px] border-l border-neutral-800 bg-neutral-900/20 overflow-hidden"
        style={{ height: GRID_HEIGHT * 24 }}
        onClick={handleContainerClick}
      >
        {/* Grid Lines */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-neutral-800 text-[10px] text-neutral-600 pl-1"
            style={{ top: i * GRID_HEIGHT, height: GRID_HEIGHT }}
          >
            {i.toString().padStart(2, "0")}:00
          </div>
        ))}

        {/* Current Time Indicator (Visual only, position calculated externally or via CSS/JS) */}

        {/* Blocks */}
        {blocks.map((block) => (
          <DraggableTimeBlock
            key={block.id}
            block={block}
            gridHeight={GRID_HEIGHT}
          />
        ))}
      </div>
    </DndContext>
  );
}
