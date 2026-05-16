import { cn } from "@/lib/utils";
import { ProjectStatus } from "@workspace/api-client-react";

export function StatusBadge({ status, className }: { status: ProjectStatus | string, className?: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    review: "In Review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      styles[status] || "bg-muted text-muted-foreground border-border",
      className
    )}>
      {labels[status] || status}
    </span>
  );
}
