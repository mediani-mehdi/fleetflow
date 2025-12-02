import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface Assignment {
  id: string;
  driverName: string;
  vehiclePlate: string;
  vehicleModel: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  status: string;
  notes?: string | null;
}

interface AssignmentHistoryProps {
  assignments: Assignment[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  },
};

export function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  const getDuration = (start: Date | string, end?: Date | string | null) => {
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = end ? (typeof end === "string" ? new Date(end) : end) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="hidden md:table-cell">Start Date</TableHead>
            <TableHead className="hidden md:table-cell">End Date</TableHead>
            <TableHead className="hidden lg:table-cell">Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const config = statusConfig[assignment.status] || statusConfig.active;
            return (
              <TableRow
                key={assignment.id}
                className="hover-elevate"
                data-testid={`row-assignment-${assignment.id}`}
              >
                <TableCell className="font-medium">
                  {assignment.driverName}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{assignment.vehiclePlate}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.vehicleModel}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(assignment.startDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {assignment.endDate
                    ? format(new Date(assignment.endDate), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {getDuration(assignment.startDate, assignment.endDate)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "no-default-hover-elevate no-default-active-elevate",
                      config.className
                    )}
                  >
                    {config.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
