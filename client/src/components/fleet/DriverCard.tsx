import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Car } from "lucide-react";
import { cn } from "@/lib/utils";

export type DriverRole = "manager" | "senior" | "standard" | "trainee";

export interface Driver {
  id: string;
  name: string;
  role: string;
  location: string;
  phone: string;
  assignedVehicle?: string;
  available: boolean;
}

interface DriverCardProps {
  driver: Driver;
  onSelect?: (driverId: string) => void;
  selected?: boolean;
  compact?: boolean;
}

const roleColors: Record<string, string> = {
  manager: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  senior: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  standard: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  trainee: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const roleLabels: Record<string, string> = {
  manager: "Manager",
  senior: "Senior Driver",
  standard: "Driver",
  trainee: "Trainee",
};

export function DriverCard({
  driver,
  onSelect,
  selected,
  compact = false,
}: DriverCardProps) {
  const initials = driver.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-colors",
        selected && "ring-2 ring-primary",
        !driver.available && "opacity-60"
      )}
      onClick={() => driver.available && onSelect?.(driver.id)}
      data-testid={`card-driver-${driver.id}`}
    >
      <CardContent className={cn("flex items-center gap-4", compact ? "p-3" : "p-4")}>
        <Avatar className={cn(compact ? "h-10 w-10" : "h-12 w-12")}>
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{driver.name}</p>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs no-default-hover-elevate no-default-active-elevate",
                roleColors[driver.role] || roleColors.standard
              )}
            >
              {roleLabels[driver.role] || driver.role}
            </Badge>
          </div>
          {!compact && (
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {driver.location}
              </span>
              <span className="flex items-center gap-1 hidden sm:flex">
                <Phone className="h-3 w-3" />
                {driver.phone}
              </span>
            </div>
          )}
          {driver.assignedVehicle && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Car className="h-3 w-3" />
              {driver.assignedVehicle}
            </p>
          )}
        </div>
        {!driver.available && (
          <Badge variant="secondary" className="text-xs">
            Unavailable
          </Badge>
        )}
        {driver.available && onSelect && (
          <Button
            size="sm"
            variant={selected ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(driver.id);
            }}
            data-testid={`button-select-driver-${driver.id}`}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
