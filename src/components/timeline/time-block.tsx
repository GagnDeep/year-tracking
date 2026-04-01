import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TimeBlock as TimeBlockType } from "@/lib/scheduler";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TimeBlockProps {
  block: TimeBlockType;
  height: number;
  top: number;
  onDelete?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    "Work": "bg-blue-600 border-blue-700 hover:bg-blue-500",
    "Deep Work": "bg-indigo-600 border-indigo-700 hover:bg-indigo-500",
    "Health": "bg-emerald-600 border-emerald-700 hover:bg-emerald-500",
    "Meeting": "bg-orange-600 border-orange-700 hover:bg-orange-500",
    "Leisure": "bg-neutral-600 border-neutral-700 hover:bg-neutral-500",
};

export function TimeBlockComponent({ block, height, top, onDelete }: TimeBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { ...block },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    height: `${height}px`,
    top: `${top}px`,
  };

  const colorClass = CATEGORY_COLORS[block.category] || "bg-primary border-primary/50 hover:bg-primary/90";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute left-14 right-2 rounded-md border p-2 text-xs text-white shadow-sm transition-colors group cursor-grab active:cursor-grabbing z-10",
        colorClass,
        isDragging && "opacity-50 z-50 scale-105 shadow-xl"
      )}
    >
      <div className="flex justify-between items-start h-full">
          <div className="flex flex-col h-full overflow-hidden">
             <span className="font-semibold truncate">{block.title}</span>
             <span className="opacity-75 text-[10px] truncate">{block.category}</span>
          </div>
          {onDelete && (
              <button
                className="opacity-0 group-hover:opacity-100 hover:bg-black/20 rounded p-0.5 transition-all"
                onPointerDown={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onDelete(block.id);
                }}
              >
                  <X className="h-3 w-3" />
              </button>
          )}
      </div>
    </div>
  );
}
