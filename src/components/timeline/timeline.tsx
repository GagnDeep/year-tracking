"use client";

import { useMemo } from "react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { TimeBlock as TimeBlockType } from "@/lib/scheduler";
import { TimeBlockComponent } from "./time-block";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimelineProps {
  blocks: TimeBlockType[];
  onBlockMove: (id: string, newStartTime: Date) => void;
  onBlockCreate: (startTime: Date) => void;
  onBlockDelete?: (id: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const PIXELS_PER_HOUR = 60;

export function Timeline({ blocks, onBlockMove, onBlockCreate, onBlockDelete }: TimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const block = blocks.find((b) => b.id === active.id);
    if (!block) return;

    // Calculate new start time based on delta Y
    const minutesDelta = (delta.y / PIXELS_PER_HOUR) * 60;
    const newStartTime = new Date(block.startTime.getTime() + minutesDelta * 60000);

    // Snap to 15 mins
    const roundedMinutes = Math.round(newStartTime.getMinutes() / 15) * 15;
    newStartTime.setMinutes(roundedMinutes);
    newStartTime.setSeconds(0);
    newStartTime.setMilliseconds(0);

    onBlockMove(block.id, newStartTime);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Create block at clicked time
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top + e.currentTarget.scrollTop;
      const hour = Math.floor(y / PIXELS_PER_HOUR);
      const minute = Math.floor((y % PIXELS_PER_HOUR) / PIXELS_PER_HOUR * 60);

      const startTime = new Date();
      startTime.setHours(hour, minute, 0, 0);
      onBlockCreate(startTime);
  };

  const isEmpty = blocks.length === 0;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative h-full overflow-y-auto bg-card select-none">
        {isEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none z-0 opacity-50">
                <Clock className="w-12 h-12 mb-2" />
                <p>No tasks scheduled.</p>
                <p className="text-xs">Click anywhere to add a block.</p>
            </div>
        )}

        <div
            className="relative min-h-[1440px]"
            style={{ height: HOURS.length * PIXELS_PER_HOUR }}
            onClick={handleTimelineClick}
        >
          {/* Grid Lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full border-t border-border flex items-center"
              style={{ top: hour * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}
            >
              <span className="w-12 text-right text-xs text-muted-foreground pr-2 -mt-[calc(100%-10px)]">
                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
              </span>
            </div>
          ))}

          {/* Blocks */}
          {blocks.map((block) => {
            const startMinutes = block.startTime.getHours() * 60 + block.startTime.getMinutes();
            const endMinutes = block.endTime.getHours() * 60 + block.endTime.getMinutes();
            const durationMinutes = endMinutes - startMinutes;

            const top = (startMinutes / 60) * PIXELS_PER_HOUR;
            const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

            return (
              <TimeBlockComponent
                key={block.id}
                block={block}
                height={Math.max(height, 20)} // Min height
                top={top}
                onDelete={onBlockDelete}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
