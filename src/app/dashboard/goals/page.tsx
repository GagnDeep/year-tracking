"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Plus, Trash2, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  const [newGoalTitle, setNewGoalTitle] = useState("");

  const utils = api.useUtils();
  const { data: goals, isLoading } = api.goal.getAll.useQuery();

  const createGoal = api.goal.create.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate();
      setNewGoalTitle("");
      toast.success("Goal added");
    },
    onError: () => toast.error("Failed to add goal"),
  });

  const toggleGoal = api.goal.toggle.useMutation({
    onSuccess: () => utils.goal.getAll.invalidate(),
    onError: () => toast.error("Failed to update goal"),
  });

  const deleteGoal = api.goal.delete.useMutation({
    onSuccess: () => {
        utils.goal.getAll.invalidate();
        toast.success("Goal deleted");
    },
    onError: () => toast.error("Failed to delete goal"),
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    createGoal.mutate({ title: newGoalTitle });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Goals
        </h1>
        <p className="text-muted-foreground">Track your long-term objectives and milestones.</p>
      </div>

      <form onSubmit={handleAddGoal} className="flex gap-2">
        <Input
          placeholder="Add a new goal..."
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={createGoal.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </form>

      <div className="flex flex-col gap-4">
        {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : goals?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No goals yet. Dream big!
            </div>
        ) : (
          goals?.map((goal) => (
            <Card key={goal.id} className="overflow-hidden group">
                <CardContent className="p-4 flex items-center gap-4">
                    <Button
                        variant={goal.completed ? "default" : "outline"}
                        size="icon"
                        className={cn("rounded-full h-8 w-8 shrink-0", goal.completed ? "bg-green-500 hover:bg-green-600 border-green-500" : "")}
                        onClick={() => toggleGoal.mutate({ id: goal.id, completed: !goal.completed })}
                    >
                        <Check className={cn("h-4 w-4", goal.completed ? "text-white" : "text-transparent")} />
                    </Button>
                    <div className="flex-1">
                        <span className={cn("font-medium text-lg", goal.completed && "line-through text-muted-foreground")}>
                            {goal.title}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteGoal.mutate({ id: goal.id })}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
