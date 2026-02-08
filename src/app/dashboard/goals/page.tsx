"use client";

import { useState } from "react";
import { Plus, Trash, Check, Square, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: goals, isLoading } = api.goal.getGoals.useQuery();

  const utils = api.useUtils();

  const createGoal = api.goal.createGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal created");
      setIsCreateOpen(false);
      void utils.goal.getGoals.invalidate();
    },
  });

  const deleteGoal = api.goal.deleteGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted");
      void utils.goal.getGoals.invalidate();
    },
  });

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(data: GoalFormValues) {
    createGoal.mutate(data);
    form.reset();
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         <Skeleton className="h-[200px] w-full" />
         <Skeleton className="h-[200px] w-full" />
         <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Learn Guitar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Practice daily..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createGoal.isPending}>
                    {createGoal.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals?.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onDelete={() => deleteGoal.mutate({ id: goal.id })}
          />
        ))}
      </div>
      {goals?.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-lg border-dashed">
           <TargetIcon className="h-10 w-10 mb-2 opacity-20" />
           <p>No goals yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onDelete }: { goal: any; onDelete: () => void }) {
  const utils = api.useUtils();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const createTask = api.goal.createTask.useMutation({
    onSuccess: () => {
      void utils.goal.getGoals.invalidate();
      setNewTaskTitle("");
    },
  });

  const updateTask = api.goal.updateTask.useMutation({
    onSuccess: (updatedTask) => {
        void utils.goal.getGoals.invalidate();

        // Optimistic check for goal completion
        // If the updated task was completed, check if all others are completed
        if (updatedTask.completed) {
            const allOthersCompleted = goal.tasks.every((t: any) =>
                t.id === updatedTask.id ? true : t.completed
            );

            if (allOthersCompleted && goal.tasks.length > 0) {
                 confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                toast.success("Goal Completed! 🎉");
            }
        }
    },
  });

  const deleteTask = api.goal.deleteTask.useMutation({
      onSuccess: () => void utils.goal.getGoals.invalidate(),
  });

  const scheduleTask = api.block.upsertBlock.useMutation({
      onSuccess: () => {
          toast.success("Task added to today's schedule");
      }
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask.mutate({ goalId: goal.id, title: newTaskTitle });
  };

  const handleSchedule = (taskTitle: string) => {
      // Create a block for today at next hour
      const now = new Date();
      // Round to next hour
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);

      const startHour = now.getHours();
      const endHour = startHour + 1;

      const start = `${startHour.toString().padStart(2, '0')}:00`;
      const end = `${endHour.toString().padStart(2, '0')}:00`;

      scheduleTask.mutate({
          title: taskTitle,
          startTime: start,
          endTime: end,
          date: new Date(),
          type: 'task',
          category: 'work'
      });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{goal.title}</CardTitle>
            {goal.description && (
              <CardDescription>{goal.description}</CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="space-y-2">
          {goal.tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-2 group">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) =>
                  updateTask.mutate({ id: task.id, completed: !!checked })
                }
              />
              <span
                className={`flex-1 text-sm ${
                  task.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </span>
               <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleSchedule(task.title)}
                                title="Schedule for Today"
                            >
                                <CalendarPlus className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Schedule for Today</TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteTask.mutate({ id: task.id })}
                 >
                    <Trash className="h-3 w-3 text-destructive" />
                 </Button>
               </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleAddTask} className="flex w-full items-center gap-2">
          <Input
            placeholder="Add task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="h-8"
          />
          <Button type="submit" size="sm" variant="secondary" disabled={createTask.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

function TargetIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
