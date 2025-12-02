import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleTable } from "@/components/fleet/VehicleTable";
import { AddVehicleModal } from "@/components/fleet/AddVehicleModal";
import { AssignmentModal } from "@/components/fleet/AssignmentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { VehicleWithAssignment, ClientWithAssignment } from "@shared/schema";

export default function VehiclesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithAssignment | null>(null);

  const { data: vehicles = [], isLoading } = useQuery<VehicleWithAssignment[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<ClientWithAssignment[]>({
    queryKey: ["/api/drivers"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: { licensePlate: string; make: string; model: string; type: string; location: string }) => {
      return apiRequest("/api/vehicles", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Vehicle Added",
        description: "New vehicle has been added to the fleet",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: { vehicleId: string; driverId: string; notes?: string }) => {
      return apiRequest("/api/assignments", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Vehicle Assigned",
        description: `${selectedVehicle?.make} ${selectedVehicle?.model} has been assigned`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign vehicle",
        variant: "destructive",
      });
    },
  });

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
    createAssignmentMutation.mutate({
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      notes: data.notes || undefined,
    });
  };

  const handleAddVehicle = (data: { licensePlate: string; make: string; model: string; type: string; location: string }) => {
    createVehicleMutation.mutate(data);
  };

  const tabCounts = {
    all: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    assigned: vehicles.filter((v) => v.status === "assigned").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
  };

  const availableDrivers = drivers.filter((d) => d.available);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

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
            placeholder="Search by plate (e.g. 12345-A-26), make, model..."
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

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No vehicles found</p>
          <p className="text-muted-foreground">
            {vehicles.length === 0
              ? "Add your first vehicle to get started"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          onAssign={handleAssign}
          onEdit={(id) => console.log("Edit vehicle:", id)}
          onViewHistory={(id) => console.log("View history:", id)}
        />
      )}

      {selectedVehicle && (
        <AssignmentModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          vehicleInfo={selectedVehicle}
          drivers={availableDrivers}
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
