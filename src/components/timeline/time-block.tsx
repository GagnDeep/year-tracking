import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { TimeBlock } from "@/lib/scheduler";

interface DraggableTimeBlockProps {
  block: TimeBlock & { id: string; title?: string };
  gridHeight: number;
}

export function DraggableTimeBlock({ block, gridHeight }: DraggableTimeBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: {
      type: "TimeBlock",
      block,
    },
  });

  const startHour = block.startTime.getHours() + block.startTime.getMinutes() / 60;
  const duration = (block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60 * 60);

  const style = {
    top: `${startHour * gridHeight}px`,
    height: `${duration * gridHeight}px`,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute left-2 right-2 rounded-md border border-l-4 p-1 text-xs shadow-sm transition-opacity z-10 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 z-50",
        block.category === "Work" && "bg-blue-900/50 border-blue-500 text-blue-100",
        block.category === "Deep Work" && "bg-indigo-900/50 border-indigo-500 text-indigo-100",
        block.category === "Health" && "bg-emerald-900/50 border-emerald-500 text-emerald-100",
        !["Work", "Deep Work", "Health"].includes(block.category) && "bg-neutral-800 border-neutral-600"
      )}
    >
      <div className="font-semibold truncate">{block.title || "Untitled"}</div>
      <div className="text-[10px] opacity-70">
        {formatTime(block.startTime)} - {formatTime(block.endTime)}
      </div>
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
