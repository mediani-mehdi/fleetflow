import { useState } from "react";
import { DriverCard, Driver } from "../fleet/DriverCard";

// todo: remove mock functionality
const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "John Smith",
    role: "senior",
    location: "Downtown HQ",
    phone: "(555) 123-4567",
    available: true,
  },
  {
    id: "2",
    name: "Jane Doe",
    role: "manager",
    location: "East Branch",
    phone: "(555) 234-5678",
    assignedVehicle: "Ford Explorer (XYZ-5678)",
    available: false,
  },
  {
    id: "3",
    name: "Bob Wilson",
    role: "trainee",
    location: "Warehouse",
    phone: "(555) 345-6789",
    available: true,
  },
];

export default function DriverCardExample() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {mockDrivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
          selected={selectedId === driver.id}
          onSelect={setSelectedId}
        />
      ))}
    </div>
  );
}
