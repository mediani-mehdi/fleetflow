import { useState } from "react";
import { AssignmentHistory, Assignment } from "@/components/fleet/AssignmentHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, CalendarIcon, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// todo: remove mock functionality
const mockAssignments: Assignment[] = [
  { id: "1", driverName: "John Smith", vehiclePlate: "XYZ-5678", vehicleModel: "Ford Explorer", startDate: new Date("2024-11-15"), status: "active" },
  { id: "2", driverName: "Jane Doe", vehiclePlate: "GHI-3456", vehicleModel: "Honda Odyssey", startDate: new Date("2024-11-10"), status: "active" },
  { id: "3", driverName: "Bob Wilson", vehiclePlate: "STU-9012", vehicleModel: "Ram 1500", startDate: new Date("2024-11-05"), status: "active" },
  { id: "4", driverName: "Alice Brown", vehiclePlate: "ABC-1234", vehicleModel: "Toyota Camry", startDate: new Date("2024-10-20"), endDate: new Date("2024-11-01"), status: "completed" },
  { id: "5", driverName: "Charlie Davis", vehiclePlate: "JKL-7890", vehicleModel: "Tesla Model 3", startDate: new Date("2024-10-15"), endDate: new Date("2024-10-25"), status: "completed" },
  { id: "6", driverName: "Diana Evans", vehiclePlate: "DEF-9012", vehicleModel: "Chevrolet Silverado", startDate: new Date("2024-10-01"), endDate: new Date("2024-10-10"), status: "cancelled", notes: "Vehicle recalled for maintenance" },
  { id: "7", driverName: "John Smith", vehiclePlate: "ABC-1234", vehicleModel: "Toyota Camry", startDate: new Date("2024-09-15"), endDate: new Date("2024-10-01"), status: "completed" },
  { id: "8", driverName: "Jane Doe", vehiclePlate: "MNO-1234", vehicleModel: "BMW X5", startDate: new Date("2024-09-01"), endDate: new Date("2024-09-20"), status: "completed" },
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    
    const matchesDateFrom = !dateFrom || assignment.startDate >= dateFrom;
    const matchesDateTo = !dateTo || assignment.startDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleExport = () => {
    console.log("Exporting assignments...", filteredAssignments);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Assignment History</h1>
          <p className="text-muted-foreground">
            View and search past vehicle assignments
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by driver, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-history"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-status-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                  data-testid="button-date-from"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                  data-testid="button-date-to"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAssignments.length} of {mockAssignments.length} assignments
      </div>

      <AssignmentHistory assignments={filteredAssignments} />
    </div>
  );
}
