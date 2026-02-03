import { LayoutProvider } from "@/context/layout-context";
import { DashboardShell } from "./dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      <DashboardShell>{children}</DashboardShell>
    </LayoutProvider>
  );
}
