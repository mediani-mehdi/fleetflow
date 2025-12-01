import { AssignmentHistory, Assignment } from "../fleet/AssignmentHistory";

// todo: remove mock functionality
const mockAssignments: Assignment[] = [
  {
    id: "1",
    driverName: "John Smith",
    vehiclePlate: "ABC-1234",
    vehicleModel: "Toyota Camry",
    startDate: new Date("2024-11-15"),
    status: "active",
  },
  {
    id: "2",
    driverName: "Jane Doe",
    vehiclePlate: "XYZ-5678",
    vehicleModel: "Ford Explorer",
    startDate: new Date("2024-11-01"),
    endDate: new Date("2024-11-14"),
    status: "completed",
  },
  {
    id: "3",
    driverName: "Bob Wilson",
    vehiclePlate: "DEF-9012",
    vehicleModel: "Chevrolet Silverado",
    startDate: new Date("2024-10-20"),
    endDate: new Date("2024-10-25"),
    status: "cancelled",
    notes: "Vehicle recalled for maintenance",
  },
];

export default function AssignmentHistoryExample() {
  return <AssignmentHistory assignments={mockAssignments} />;
}
