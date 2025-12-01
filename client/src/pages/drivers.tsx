import { useState } from "react";
import { DriverCard, Driver } from "@/components/fleet/DriverCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockDrivers: Driver[] = [
  { id: "1", name: "John Smith", role: "senior", location: "Downtown HQ", phone: "(555) 123-4567", assignedVehicle: "Ford Explorer (XYZ-5678)", available: false },
  { id: "2", name: "Jane Doe", role: "manager", location: "East Branch", phone: "(555) 234-5678", assignedVehicle: "Honda Odyssey (GHI-3456)", available: false },
  { id: "3", name: "Bob Wilson", role: "trainee", location: "Warehouse", phone: "(555) 345-6789", assignedVehicle: "Ram 1500 (STU-9012)", available: false },
  { id: "4", name: "Alice Brown", role: "standard", location: "Downtown HQ", phone: "(555) 456-7890", available: true },
  { id: "5", name: "Charlie Davis", role: "senior", location: "North Office", phone: "(555) 567-8901", available: true },
  { id: "6", name: "Diana Evans", role: "standard", location: "East Branch", phone: "(555) 678-9012", available: true },
  { id: "7", name: "Edward Foster", role: "trainee", location: "Downtown HQ", phone: "(555) 789-0123", available: true },
  { id: "8", name: "Fiona Garcia", role: "manager", location: "Warehouse", phone: "(555) 890-1234", available: true },
];

export default function DriversPage() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState(mockDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    role: "",
    location: "",
    phone: "",
  });

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);
    const matchesRole = roleFilter === "all" || driver.role === roleFilter;
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && driver.available) ||
      (availabilityFilter === "assigned" && !driver.available);
    return matchesSearch && matchesRole && matchesAvailability;
  });

  const stats = {
    total: drivers.length,
    available: drivers.filter((d) => d.available).length,
    assigned: drivers.filter((d) => !d.available).length,
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.role || !newDriver.location || !newDriver.phone) return;
    
    const driver: Driver = {
      id: String(drivers.length + 1),
      name: newDriver.name,
      role: newDriver.role as Driver["role"],
      location: newDriver.location,
      phone: newDriver.phone,
      available: true,
    };
    
    setDrivers((prev) => [...prev, driver]);
    setNewDriver({ name: "", role: "", location: "", phone: "" });
    setAddDriverOpen(false);
    toast({
      title: "Driver Added",
      description: `${driver.name} has been added to the system`,
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Drivers</h1>
          <p className="text-muted-foreground">
            {stats.total} drivers ({stats.available} available, {stats.assigned} assigned)
          </p>
        </div>
        <Button onClick={() => setAddDriverOpen(true)} data-testid="button-add-driver">
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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
          <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-role-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="trainee">Trainee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-availability-filter">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No drivers found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDrivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onSelect={(id) => console.log("Selected driver:", id)}
            />
          ))}
        </div>
      )}

      <Dialog open={addDriverOpen} onOpenChange={setAddDriverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Enter the driver's details to add them to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Full Name *</Label>
              <Input
                id="driverName"
                placeholder="John Smith"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                data-testid="input-driver-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverRole">Role *</Label>
              <Select
                value={newDriver.role}
                onValueChange={(value) => setNewDriver({ ...newDriver, role: value })}
              >
                <SelectTrigger id="driverRole" data-testid="select-driver-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="senior">Senior Driver</SelectItem>
                  <SelectItem value="standard">Driver</SelectItem>
                  <SelectItem value="trainee">Trainee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverLocation">Location *</Label>
              <Select
                value={newDriver.location}
                onValueChange={(value) => setNewDriver({ ...newDriver, location: value })}
              >
                <SelectTrigger id="driverLocation" data-testid="select-driver-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Downtown HQ">Downtown HQ</SelectItem>
                  <SelectItem value="East Branch">East Branch</SelectItem>
                  <SelectItem value="North Office">North Office</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Phone *</Label>
              <Input
                id="driverPhone"
                placeholder="(555) 123-4567"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                data-testid="input-driver-phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDriverOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDriver}
              disabled={!newDriver.name || !newDriver.role || !newDriver.location || !newDriver.phone}
              data-testid="button-submit-driver"
            >
              Add Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
