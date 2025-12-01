import { DriverAssignmentView } from "../fleet/DriverAssignmentView";

// todo: remove mock functionality
const mockPastAssignments = [
  {
    id: "1",
    vehiclePlate: "XYZ-5678",
    vehicleModel: "Ford Explorer",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-10-15"),
  },
  {
    id: "2",
    vehiclePlate: "DEF-9012",
    vehicleModel: "Chevrolet Silverado",
    startDate: new Date("2024-09-10"),
    endDate: new Date("2024-09-28"),
  },
];

export default function DriverAssignmentViewExample() {
  return (
    <DriverAssignmentView
      driverName="John Smith"
      currentAssignment={{
        vehicleLicensePlate: "ABC-1234",
        vehicleMake: "Toyota",
        vehicleModel: "Camry",
        vehicleType: "sedan",
        assignedDate: new Date("2024-11-15"),
        location: "Downtown HQ - Lot A",
        notes: "Regular maintenance completed. Please check tire pressure before long trips.",
      }}
      pastAssignments={mockPastAssignments}
      onReportIssue={() => console.log("Report issue clicked")}
    />
  );
}
