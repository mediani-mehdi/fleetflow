import { VehicleTable, Vehicle } from "../fleet/VehicleTable";

// todo: remove mock functionality
const mockVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "ABC-1234",
    make: "Toyota",
    model: "Camry",
    type: "sedan",
    location: "Downtown HQ",
    status: "available",
  },
  {
    id: "2",
    licensePlate: "XYZ-5678",
    make: "Ford",
    model: "Explorer",
    type: "suv",
    location: "East Branch",
    status: "assigned",
    assignedTo: "John Smith",
  },
  {
    id: "3",
    licensePlate: "DEF-9012",
    make: "Chevrolet",
    model: "Silverado",
    type: "truck",
    location: "Warehouse",
    status: "maintenance",
  },
  {
    id: "4",
    licensePlate: "GHI-3456",
    make: "Honda",
    model: "Odyssey",
    type: "van",
    location: "North Office",
    status: "assigned",
    assignedTo: "Jane Doe",
  },
];

export default function VehicleTableExample() {
  return (
    <VehicleTable
      vehicles={mockVehicles}
      onAssign={(id) => console.log("Assign vehicle:", id)}
      onEdit={(id) => console.log("Edit vehicle:", id)}
      onViewHistory={(id) => console.log("View history:", id)}
    />
  );
}
