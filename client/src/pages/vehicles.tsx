import { useState } from "react";
import { VehicleTable, Vehicle } from "@/components/fleet/VehicleTable";
import { AddVehicleModal } from "@/components/fleet/AddVehicleModal";
import { AssignmentModal } from "@/components/fleet/AssignmentModal";
import { Driver } from "@/components/fleet/DriverCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockVehicles: Vehicle[] = [
  { id: "1", licensePlate: "ABC-1234", make: "Toyota", model: "Camry", type: "sedan", location: "Downtown HQ", status: "available" },
  { id: "2", licensePlate: "XYZ-5678", make: "Ford", model: "Explorer", type: "suv", location: "East Branch", status: "assigned", assignedTo: "John Smith" },
  { id: "3", licensePlate: "DEF-9012", make: "Chevrolet", model: "Silverado", type: "truck", location: "Warehouse", status: "maintenance" },
  { id: "4", licensePlate: "GHI-3456", make: "Honda", model: "Odyssey", type: "van", location: "North Office", status: "assigned", assignedTo: "Jane Doe" },
  { id: "5", licensePlate: "JKL-7890", make: "Tesla", model: "Model 3", type: "sedan", location: "Downtown HQ", status: "available" },
  { id: "6", licensePlate: "MNO-1234", make: "BMW", model: "X5", type: "suv", location: "East Branch", status: "out_of_service" },
];

const mockDrivers: Driver[] = [
  { id: "1", name: "Alice Brown", role: "standard", location: "Downtown HQ", phone: "(555) 456-7890", available: true },
  { id: "2", name: "Charlie Davis", role: "senior", location: "North Office", phone: "(555) 567-8901", available: true },
  { id: "3", name: "Diana Evans", role: "standard", location: "East Branch", phone: "(555) 678-9012", available: true },
];

export default function VehiclesPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && vehicle.status === activeTab;
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

  const tabCounts = {
    all: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    assigned: vehicles.filter((v) => v.status === "assigned").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Vehicles</h1>
          <p className="text-muted-foreground">Manage your fleet inventory</p>
        </div>
        <Button onClick={() => setAddVehicleOpen(true)} data-testid="button-add-vehicle">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by plate, make, model, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-vehicles"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="available" data-testid="tab-available">
              Available ({tabCounts.available})
            </TabsTrigger>
            <TabsTrigger value="assigned" data-testid="tab-assigned">
              Assigned ({tabCounts.assigned})
            </TabsTrigger>
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">
              Maintenance ({tabCounts.maintenance})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <VehicleTable
        vehicles={filteredVehicles}
        onAssign={handleAssign}
        onEdit={(id) => console.log("Edit vehicle:", id)}
        onViewHistory={(id) => console.log("View history:", id)}
      />

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
