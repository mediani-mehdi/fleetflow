import { useState } from "react";
import { AssignmentModal } from "../fleet/AssignmentModal";
import { Button } from "@/components/ui/button";
import { Driver } from "../fleet/DriverCard";

// todo: remove mock functionality
const mockDrivers: Driver[] = [
  { id: "1", name: "John Smith", role: "senior", location: "Downtown HQ", phone: "(555) 123-4567", available: true },
  { id: "2", name: "Jane Doe", role: "manager", location: "East Branch", phone: "(555) 234-5678", available: true },
  { id: "3", name: "Bob Wilson", role: "trainee", location: "Warehouse", phone: "(555) 345-6789", available: true },
  { id: "4", name: "Alice Brown", role: "standard", location: "Downtown HQ", phone: "(555) 456-7890", available: true },
  { id: "5", name: "Charlie Davis", role: "senior", location: "North Office", phone: "(555) 567-8901", available: false },
];

export default function AssignmentModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)} data-testid="button-open-modal">
        Open Assignment Modal
      </Button>
      <AssignmentModal
        open={open}
        onOpenChange={setOpen}
        vehicleInfo={{
          id: "1",
          licensePlate: "ABC-1234",
          make: "Toyota",
          model: "Camry",
        }}
        drivers={mockDrivers}
        onAssign={(data) => {
          console.log("Assignment created:", data);
          setOpen(false);
        }}
      />
    </div>
  );
}
