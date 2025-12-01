import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DriverCard, Driver } from "./DriverCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter } from "lucide-react";

interface AssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleInfo: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
  drivers: Driver[];
  onAssign: (data: { vehicleId: string; driverId: string; notes: string }) => void;
}

export function AssignmentModal({
  open,
  onOpenChange,
  vehicleInfo,
  drivers,
  onAssign,
}: AssignmentModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || driver.role === roleFilter;
    return matchesSearch && matchesRole && driver.available;
  });

  const handleSubmit = () => {
    if (selectedDriverId) {
      onAssign({
        vehicleId: vehicleInfo.id,
        driverId: selectedDriverId,
        notes,
      });
      onOpenChange(false);
      setSelectedDriverId(null);
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
          <DialogDescription>
            Assign {vehicleInfo.make} {vehicleInfo.model} ({vehicleInfo.licensePlate}) to a driver
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-drivers"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-role-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="senior">Senior Driver</SelectItem>
              <SelectItem value="standard">Driver</SelectItem>
              <SelectItem value="trainee">Trainee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6 min-h-0 max-h-[300px]">
          <div className="space-y-2">
            {filteredDrivers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No available drivers found
              </p>
            ) : (
              filteredDrivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  selected={selectedDriverId === driver.id}
                  onSelect={setSelectedDriverId}
                  compact
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4">
          <Label htmlFor="notes">Assignment Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about this assignment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 resize-none"
            rows={2}
            data-testid="textarea-assignment-notes"
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-assignment"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDriverId}
            data-testid="button-confirm-assignment"
          >
            Assign Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
