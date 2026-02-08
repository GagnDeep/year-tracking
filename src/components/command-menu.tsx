"use client";

import { useEffect, useState } from "react";
import {
  CalendarIcon,
  LayoutDashboard,
  Settings,
  Target,
  BarChart,
  User,
  LogOut,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/trpc/react";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const router = useRouter();
  const { setTheme } = useTheme();

  const { data: searchResults } = api.search.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 }
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
         Press ⌘K
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
            placeholder="Type a command or search..."
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults && (
            <>
                <CommandGroup heading="Search Results">
                    {searchResults.goals.map((goal) => (
                        <CommandItem
                            key={goal.id}
                            onSelect={() => runCommand(() => router.push(`/dashboard/goals`))}
                        >
                            <Target className="mr-2 h-4 w-4" />
                            <span>Goal: {goal.title}</span>
                        </CommandItem>
                    ))}
                    {searchResults.journalEntries.map((entry) => (
                        <CommandItem
                            key={entry.id}
                            onSelect={() => runCommand(() => router.push(`/dashboard/calendar?date=${format(entry.date, "yyyy-MM-dd")}`))}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Journal: {format(entry.date, "MMM d")}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
            </>
          )}
          <CommandGroup heading="Actions">
             <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/goals"))} // Ideally open dialog
            >
              <Target className="mr-2 h-4 w-4" />
              <span>Create Goal</span>
            </CommandItem>
             <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))} // Focus journal
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Journal Today</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/goals"))}
            >
              <Target className="mr-2 h-4 w-4" />
              <span>Goals</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/calendar"))}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/stats"))}
            >
              <BarChart className="mr-2 h-4 w-4" />
              <span>Statistics</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => signOut())}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
