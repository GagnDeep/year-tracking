"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Calendar, LayoutDashboard, Settings } from "lucide-react";
import { format } from "date-fns";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const getTodayPath = () => `/dashboard/day/${format(new Date(), "yyyy-MM-dd")}`;

  // Toggle Command Menu
  useHotkeys("meta+k, ctrl+k", (e) => {
    e.preventDefault();
    setOpen((open) => !open);
  });

  // Shortcuts
  useHotkeys("g+y", () => router.push("/dashboard"));
  useHotkeys("g+t", () => router.push(getTodayPath()));
  useHotkeys("c", (e) => {
      e.preventDefault();
      router.push(getTodayPath());
  });

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setOpen(false); router.push("/dashboard"); }}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Year View</span>
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push(getTodayPath()); }}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Today</span>
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push("/dashboard/month"); }}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Month View</span>
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); router.push("/dashboard/stats"); }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Stats</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
