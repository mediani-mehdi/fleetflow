import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge, VehicleStatus } from "./StatusBadge";
import { MoreHorizontal, Car, Truck, Bus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  type: "sedan" | "suv" | "truck" | "van";
  location: string;
  status: VehicleStatus;
  assignedTo?: string;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  onAssign?: (vehicleId: string) => void;
  onEdit?: (vehicleId: string) => void;
  onViewHistory?: (vehicleId: string) => void;
}

const vehicleIcons = {
  sedan: Car,
  suv: Car,
  truck: Truck,
  van: Bus,
};

export function VehicleTable({
  vehicles,
  onAssign,
  onEdit,
  onViewHistory,
}: VehicleTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => {
            const VehicleIcon = vehicleIcons[vehicle.type];
            return (
              <TableRow
                key={vehicle.id}
                className="hover-elevate"
                data-testid={`row-vehicle-${vehicle.id}`}
              >
                <TableCell>
                  <StatusBadge status={vehicle.status} />
                </TableCell>
                <TableCell className="font-medium">
                  {vehicle.licensePlate}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {vehicle.make} {vehicle.model}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {vehicle.location}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {vehicle.assignedTo || (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-actions-${vehicle.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {vehicle.status === "available" && (
                        <DropdownMenuItem
                          onClick={() => onAssign?.(vehicle.id)}
                          data-testid={`menu-assign-${vehicle.id}`}
                        >
                          Assign Driver
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit?.(vehicle.id)}
                        data-testid={`menu-edit-${vehicle.id}`}
                      >
                        Edit Vehicle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onViewHistory?.(vehicle.id)}
                        data-testid={`menu-history-${vehicle.id}`}
                      >
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
