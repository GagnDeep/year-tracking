"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface TimelineProps {
  items: Task[];
  date: string;
}

export function SortableItem({ id, title, completed, onToggle, onDelete }: Task & { onToggle: (checked: boolean) => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
        <Card className={cn("h-16 flex items-center p-2 gap-2 group", completed && "bg-muted opacity-80")}>
            <button {...attributes} {...listeners} className="cursor-grab hover:text-primary p-1">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <Checkbox checked={completed} onCheckedChange={onToggle} />
            <span className={cn("font-medium flex-1 truncate", completed && "line-through text-muted-foreground")}>{title}</span>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </Card>
    </div>
  );
}

export function Timeline({ items, date }: TimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const utils = api.useUtils();

  const updateOrder = api.task.updateOrder.useMutation({
      onMutate: async (newOrder) => {
        await utils.task.getAll.cancel({ date });
        const previousTasks = utils.task.getAll.getData({ date });

        if (previousTasks) {
            const idToOrder = new Map(newOrder.map((o) => [o.id, o.order]));
             utils.task.getAll.setData({ date }, (old) => {
                 if (!old) return [];
                 return [...old].sort((a, b) => (idToOrder.get(a.id) ?? 0) - (idToOrder.get(b.id) ?? 0));
             });
        }
        return { previousTasks };
      },
      onError: (err, newOrder, context) => {
          if (context?.previousTasks) {
              utils.task.getAll.setData({ date }, context.previousTasks);
          }
          toast.error("Failed to reorder tasks");
      },
      onSettled: () => {
          utils.task.getAll.invalidate({ date });
      }
  });

  const toggleTask = api.task.toggle.useMutation({
     onSuccess: (data) => {
         utils.task.getAll.invalidate({ date });
         if (data.completed) {
             // Check if all tasks are completed
             const allCompleted = items.every(i => i.id === data.id ? true : i.completed);
             if (allCompleted && items.length > 0) {
                 confetti();
                 toast.success("All tasks completed! 🎉");
             }
         }
     },
     onError: () => toast.error("Failed to update task")
  });

  const deleteTask = api.task.delete.useMutation({
      onSuccess: () => {
          utils.task.getAll.invalidate({ date });
          toast.success("Task deleted");
      },
      onError: () => toast.error("Failed to delete task")
  });

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update local state is handled by optimistic update in invalidate? No, wait.
      // We should ideally update local state immediately via onMutate logic or similar, but for dnd-kit visual consistency we might need local state.
      // However, since we are fetching from react-query, modifying the cache in onMutate is the way.

      const orderUpdate = newItems.map((item, index) => ({
          id: item.id,
          order: index,
      }));

      updateOrder.mutate(orderUpdate);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col">
            {items.map((item) => (
            <SortableItem
                key={item.id}
                {...item}
                onToggle={(checked) => toggleTask.mutate({ id: item.id, completed: checked })}
                onDelete={() => deleteTask.mutate({ id: item.id })}
            />
            ))}
            {items.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                    No tasks for today. Add one to get started!
                </div>
            )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
