"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHotkeys } from "react-hotkeys-hook";

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  // 'Shift+?' usually triggers on '?' key directly but ensuring correct combo
  useHotkeys("shift+?", () => setOpen(true));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Boost your productivity with these hotkeys.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ShortcutItem keys={["Cmd", "K"]} description="Open Command Menu" />
          <ShortcutItem keys={["G", "T"]} description="Go to Today" />
          <ShortcutItem keys={["G", "Y"]} description="Go to Year Grid" />
          <ShortcutItem keys={["C"]} description="Create/Log Today" />
          <ShortcutItem keys={["Shift", "?"]} description="Show this help" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
