"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // If we are just on /dashboard, maybe show nothing or just Home
  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.slice(1).map((segment, index) => {
        const path = `/dashboard/${segments.slice(1, index + 2).join("/")}`;
        const isLast = index === segments.length - 2; // segments has 'dashboard' + others

        // Format segment (e.g. "day" -> "Day", "2024-01-01" -> "Jan 1st")
        let label = segment;
        if (segment === "day") label = "Day";
        else if (segment === "month") label = "Month";
        else if (segment === "settings") label = "Settings";
        else if (segment === "stats") label = "Stats";

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={path} className="hover:text-foreground transition-colors capitalize">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
