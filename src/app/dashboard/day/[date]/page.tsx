"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import canvasConfetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/Timeline";
import Editor from "@/components/Editor";
import { formatDate, parseDate } from "@/lib/date";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DailyPage() {
  const params = useParams();
  const router = useRouter();
  // Ensure params.date is a string (it can be string | string[])
  const dateStr = Array.isArray(params?.date) ? params.date[0] : params?.date;

  // Fallback to today if dateStr is invalid or missing, though usually redirect handles it
  const date = dateStr ? parseDate(dateStr) : new Date();

  const utils = api.useUtils();

  const { data: tasks, isLoading: isTasksLoading } = api.task.getAll.useQuery({ date: dateStr });
  const { data: journalEntry, isLoading: isJournalLoading } = api.journal.get.useQuery({ date: dateStr! }, { enabled: !!dateStr });

  const createTask = api.task.create.useMutation({
    onSuccess: () => {
        utils.task.getAll.invalidate({ date: dateStr });
        setNewTaskTitle("");
        setOpen(false);
        toast.success("Task created");
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  // Sync journal content when loaded
  useEffect(() => {
    if (journalEntry) {
        setContent(journalEntry.content);
    } else if (!isJournalLoading) {
        setContent("");
    }
  }, [journalEntry, isJournalLoading]);


  const handlePrev = () => {
    router.push(`/dashboard/day/${formatDate(subDays(date, 1))}`);
  };

  const handleNext = () => {
    router.push(`/dashboard/day/${formatDate(addDays(date, 1))}`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask.mutate({ title: newTaskTitle, date: dateStr });
  };

  if (!dateStr) return null;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Prev
        </Button>
        <h2 className="text-2xl font-bold">{format(date, "EEEE, MMMM do, yyyy")}</h2>
        <Button variant="ghost" onClick={handleNext}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Tasks</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Add Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                            <Input
                                placeholder="Task title..."
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                autoFocus
                            />
                            <Button type="submit" disabled={createTask.isPending}>
                                {createTask.isPending ? "Creating..." : "Create Task"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isTasksLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : (
                <Timeline items={tasks || []} date={dateStr} />
            )}
        </div>
        <div className="flex flex-col gap-4 h-full">
            <h3 className="text-xl font-semibold">Journal</h3>
            <div className="flex-1 bg-card text-card-foreground shadow-sm h-full min-h-[500px]">
                 {isJournalLoading ? (
                    <Skeleton className="h-full w-full" />
                 ) : (
                    <Editor initialContent={content} date={dateStr} />
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}
