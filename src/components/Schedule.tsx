"use client";

import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export function Schedule({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const utils = api.useUtils();
  const { data: blocks, isLoading } = api.block.getAll.useQuery({ date });

  const createBlock = api.block.create.useMutation({
    onSuccess: () => {
      utils.block.getAll.invalidate({ date });
      setOpen(false);
      setTitle("");
      toast.success("Block added");
    },
    onError: () => toast.error("Failed to add block"),
  });

  const deleteBlock = api.block.delete.useMutation({
    onSuccess: () => {
        utils.block.getAll.invalidate({ date });
        toast.success("Block deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    createBlock.mutate({ date, title, startTime, endTime });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Schedule</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Block</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                placeholder="Title (e.g. Deep Work)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Start</label>
                    <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground">End</label>
                    <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
              </div>
              <Button type="submit" disabled={createBlock.isPending}>
                {createBlock.isPending ? "Adding..." : "Add Block"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : blocks?.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
                No blocks scheduled.
            </div>
        ) : (
            blocks?.map((block) => (
                <div key={block.id} className="flex items-center gap-2 p-2 rounded-md border bg-muted/40 text-sm group">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                        {block.startTime}-{block.endTime}
                    </span>
                    <span className="font-medium truncate flex-1">{block.title}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
                        onClick={() => deleteBlock.mutate({ id: block.id })}
                    >
                        <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}
