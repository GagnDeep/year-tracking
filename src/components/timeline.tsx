"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableBlock({
  block,
  onClick,
  onDelete,
}: {
  block: any;
  onClick: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:border-primary/50 ${
        block.category === "work"
          ? "bg-blue-50 dark:bg-blue-950/20"
          : block.category === "personal"
            ? "bg-green-50 dark:bg-green-950/20"
            : "bg-accent/50"
      }`}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/50 hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex min-w-[3rem] flex-col items-center text-xs font-mono text-muted-foreground">
        <span>{block.startTime}</span>
        <div className="my-0.5 h-2 w-[1px] bg-border" />
        <span>{block.endTime}</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">{block.title}</div>
        <div className="text-xs capitalize text-muted-foreground">
          {block.category} • {block.type}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Timeline({ date }: { date: Date }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const { data: blocks } = api.block.getBlocks.useQuery({ date });
  const utils = api.useUtils();

  const upsertBlock = api.block.upsertBlock.useMutation({
    onSuccess: () => {
      // Don't invalidate immediately on swap to avoid jumpiness, but here it's fine
      void utils.block.getBlocks.invalidate();
    },
  });

  const deleteBlock = api.block.deleteBlock.useMutation({
    onSuccess: () => {
      toast.success("Block deleted");
      void utils.block.getBlocks.invalidate();
    },
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && blocks) {
      const activeBlock = blocks.find((b) => b.id === active.id);
      const overBlock = blocks.find((b) => b.id === over.id);

      if (activeBlock && overBlock) {
         // Swap times
         const activeStart = activeBlock.startTime;
         const activeEnd = activeBlock.endTime;
         const overStart = overBlock.startTime;
         const overEnd = overBlock.endTime;

         toast.promise(
            Promise.all([
                upsertBlock.mutateAsync({
                    ...activeBlock,
                    startTime: overStart,
                    endTime: overEnd,
                }),
                upsertBlock.mutateAsync({
                    ...overBlock,
                    startTime: activeStart,
                    endTime: activeEnd,
                })
            ]),
            {
                loading: 'Reordering...',
                success: 'Schedule updated',
                error: 'Failed to reorder'
            }
         );
      }
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;

    upsertBlock.mutate({
      id: editingBlock?.id,
      title,
      startTime,
      endTime,
      date,
      category,
      type,
    }, {
        onSuccess: () => {
             toast.success("Block saved");
             setIsDialogOpen(false);
             setEditingBlock(null);
        }
    });
  };

  return (
    <div className="flex h-full flex-col rounded-md border bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Schedule for {format(date, "MMM d")}</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingBlock(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Block
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {blocks?.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
            No blocks scheduled.
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks?.map((b) => b.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {blocks?.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onClick={() => {
                  setEditingBlock(block);
                  setIsDialogOpen(true);
                }}
                onDelete={() => deleteBlock.mutate({ id: block.id })}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? "Edit Block" : "New Block"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingBlock?.title}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  defaultValue={editingBlock?.startTime || "09:00"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue={editingBlock?.endTime || "10:00"}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  name="category"
                  defaultValue={editingBlock?.category || "work"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  name="type"
                  defaultValue={editingBlock?.type || "event"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
