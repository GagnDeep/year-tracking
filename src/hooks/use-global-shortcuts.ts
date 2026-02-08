import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

export function useGlobalShortcuts() {
  const router = useRouter();

  useHotkeys("g+h", () => {
    router.push("/dashboard");
    toast.info("Navigated to Dashboard");
  });

  useHotkeys("g+g", () => {
    router.push("/dashboard/goals");
    toast.info("Navigated to Goals");
  });

  useHotkeys("g+c", () => {
    router.push("/dashboard/calendar");
    toast.info("Navigated to Calendar");
  });

  useHotkeys("g+s", () => {
    router.push("/dashboard/settings");
    toast.info("Navigated to Settings");
  });
}
