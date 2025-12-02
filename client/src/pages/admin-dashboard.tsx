import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatsCard } from "@/components/fleet/StatsCard";
import { VehicleTable } from "@/components/fleet/VehicleTable";
import { StepByStepAssignmentModal } from "@/components/fleet/StepByStepAssignmentModal";
import { AddVehicleModal } from "@/components/fleet/AddVehicleModal";
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
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { VehicleWithAssignment, ClientWithAssignment } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithAssignment | null>(null);

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<VehicleWithAssignment[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: clients = [] } = useQuery<ClientWithAssignment[]>({
    queryKey: ["/api/clients"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      const client = clients.find((c) => c.id === selectedVehicle?.id);
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
    createAssignmentMutation.mutate({
      vehicleId: data.vehicleId,
      clientId: data.driverId,
      notes: data.notes || undefined,
    });
  };

  const handleAddVehicle = (data: { licensePlate: string; make: string; model: string; type: string; location: string }) => {
    createVehicleMutation.mutate(data);
  };

  const availableClients = clients.filter((c) => c.available);

  if (vehiclesLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

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
        <StepByStepAssignmentModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          vehicleInfo={selectedVehicle}
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
