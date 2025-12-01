import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type VehicleStatus = "available" | "assigned" | "maintenance" | "out_of_service";

interface StatusBadgeProps {
  status: VehicleStatus;
  className?: string;
}

const statusConfig: Record<VehicleStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  assigned: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  out_of_service: {
    label: "Out of Service",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium no-default-hover-elevate no-default-active-elevate",
        config.className,
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        {status === "assigned" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      {config.label}
    </Badge>
  );
}
