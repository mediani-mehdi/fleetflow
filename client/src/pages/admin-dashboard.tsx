import { useState } from "react";
import { StatsCard } from "@/components/fleet/StatsCard";
import { VehicleTable, Vehicle } from "@/components/fleet/VehicleTable";
import { AssignmentModal } from "@/components/fleet/AssignmentModal";
import { AddVehicleModal } from "@/components/fleet/AddVehicleModal";
import { Driver } from "@/components/fleet/DriverCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, CheckCircle, Users, Wrench, Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockVehicles: Vehicle[] = [
  { id: "1", licensePlate: "ABC-1234", make: "Toyota", model: "Camry", type: "sedan", location: "Downtown HQ", status: "available" },
  { id: "2", licensePlate: "XYZ-5678", make: "Ford", model: "Explorer", type: "suv", location: "East Branch", status: "assigned", assignedTo: "John Smith" },
  { id: "3", licensePlate: "DEF-9012", make: "Chevrolet", model: "Silverado", type: "truck", location: "Warehouse", status: "maintenance" },
  { id: "4", licensePlate: "GHI-3456", make: "Honda", model: "Odyssey", type: "van", location: "North Office", status: "assigned", assignedTo: "Jane Doe" },
  { id: "5", licensePlate: "JKL-7890", make: "Tesla", model: "Model 3", type: "sedan", location: "Downtown HQ", status: "available" },
  { id: "6", licensePlate: "MNO-1234", make: "BMW", model: "X5", type: "suv", location: "East Branch", status: "out_of_service" },
  { id: "7", licensePlate: "PQR-5678", make: "Mercedes", model: "Sprinter", type: "van", location: "Warehouse", status: "available" },
  { id: "8", licensePlate: "STU-9012", make: "Ram", model: "1500", type: "truck", location: "Downtown HQ", status: "assigned", assignedTo: "Bob Wilson" },
];

const mockDrivers: Driver[] = [
  { id: "1", name: "John Smith", role: "senior", location: "Downtown HQ", phone: "(555) 123-4567", available: false },
  { id: "2", name: "Jane Doe", role: "manager", location: "East Branch", phone: "(555) 234-5678", available: false },
  { id: "3", name: "Bob Wilson", role: "trainee", location: "Warehouse", phone: "(555) 345-6789", available: false },
  { id: "4", name: "Alice Brown", role: "standard", location: "Downtown HQ", phone: "(555) 456-7890", available: true },
  { id: "5", name: "Charlie Davis", role: "senior", location: "North Office", phone: "(555) 567-8901", available: true },
  { id: "6", name: "Diana Evans", role: "standard", location: "East Branch", phone: "(555) 678-9012", available: true },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    assigned: vehicles.filter((v) => v.status === "assigned").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance" || v.status === "out_of_service").length,
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAssign = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setAssignModalOpen(true);
    }
  };

  const handleAssignSubmit = (data: { vehicleId: string; driverId: string; notes: string }) => {
    const driver = mockDrivers.find((d) => d.id === data.driverId);
    if (driver) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.vehicleId
            ? { ...v, status: "assigned" as const, assignedTo: driver.name }
            : v
        )
      );
      toast({
        title: "Vehicle Assigned",
        description: `${selectedVehicle?.make} ${selectedVehicle?.model} assigned to ${driver.name}`,
      });
    }
  };

  const handleAddVehicle = (data: { licensePlate: string; make: string; model: string; type: string; location: string }) => {
    const newVehicle: Vehicle = {
      id: String(vehicles.length + 1),
      licensePlate: data.licensePlate,
      make: data.make,
      model: data.model,
      type: data.type as Vehicle["type"],
      location: data.location,
      status: "available",
    };
    setVehicles((prev) => [...prev, newVehicle]);
    toast({
      title: "Vehicle Added",
      description: `${data.make} ${data.model} (${data.licensePlate}) added to fleet`,
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your fleet status</p>
        </div>
        <Button onClick={() => setAddVehicleOpen(true)} data-testid="button-add-vehicle">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Vehicles"
          value={stats.total}
          icon={Car}
          description="Fleet size"
        />
        <StatsCard
          title="Available"
          value={stats.available}
          icon={CheckCircle}
          description="Ready for assignment"
        />
        <StatsCard
          title="Active Drivers"
          value={stats.assigned}
          icon={Users}
          description="Currently assigned"
        />
        <StatsCard
          title="In Service"
          value={stats.maintenance}
          icon={Wrench}
          description="Maintenance/Out of service"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-vehicles"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <VehicleTable
          vehicles={filteredVehicles}
          onAssign={handleAssign}
          onEdit={(id) => console.log("Edit vehicle:", id)}
          onViewHistory={(id) => console.log("View history:", id)}
        />
      </div>

      {selectedVehicle && (
        <AssignmentModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          vehicleInfo={selectedVehicle}
          drivers={mockDrivers}
          onAssign={handleAssignSubmit}
        />
      )}

      <AddVehicleModal
        open={addVehicleOpen}
        onOpenChange={setAddVehicleOpen}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
}
