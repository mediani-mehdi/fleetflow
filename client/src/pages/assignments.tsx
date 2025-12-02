import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepByStepAssignmentModal } from "@/components/fleet/StepByStepAssignmentModal";
import { Search, Filter, Plus, Calendar, User, Car, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { AssignmentWithDetails, VehicleWithAssignment, ClientWithAssignment } from "@shared/schema";

export default function AssignmentsPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentWithDetails[]>({
        queryKey: ["/api/assignments"],
    });

    const { data: vehicles = [] } = useQuery<VehicleWithAssignment[]>({
        queryKey: ["/api/vehicles"],
    });

    const { data: clients = [] } = useQuery<ClientWithAssignment[]>({
        queryKey: ["/api/clients"],
    });

    const createAssignmentMutation = useMutation({
        mutationFn: async (data: { vehicleId: string; clientId: string; notes?: string; startDate?: Date; endDate?: Date }) => {
            return apiRequest("/api/assignments", { method: "POST", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            setAssignModalOpen(false);
            toast({
                title: "Assignment Created",
                description: "Vehicle has been successfully assigned to client",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create assignment",
                variant: "destructive",
            });
        },
    });

    const completeAssignmentMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest(`/api/assignments/${id}/complete`, { method: "POST" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            toast({
                title: "Assignment Completed",
                description: "Assignment has been marked as completed",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to complete assignment",
                variant: "destructive",
            });
        },
    });

    const cancelAssignmentMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest(`/api/assignments/${id}/cancel`, { method: "POST" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            toast({
                title: "Assignment Cancelled",
                description: "Assignment has been cancelled",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to cancel assignment",
                variant: "destructive",
            });
        },
    });

    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch =
            assignment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: assignments.length,
        active: assignments.filter((a) => a.status === "active").length,
        completed: assignments.filter((a) => a.status === "completed").length,
        cancelled: assignments.filter((a) => a.status === "cancelled").length,
    };

    const handleCreateAssignment = (data: { vehicleId: string; clientId: string; notes: string; startDate?: Date; endDate?: Date }) => {
        createAssignmentMutation.mutate({
            vehicleId: data.vehicleId,
            clientId: data.clientId,
            notes: data.notes || undefined,
            startDate: data.startDate,
            endDate: data.endDate,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Clock className="h-4 w-4" />;
            case "completed":
                return <CheckCircle className="h-4 w-4" />;
            case "cancelled":
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "active":
                return "default";
            case "completed":
                return "secondary";
            case "cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };

    const availableVehicles = vehicles.filter((v) => v.status === "available");
    const availableClients = clients.filter((c) => c.available);

    if (assignmentsLoading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-40" />
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
                    <h1 className="text-2xl font-semibold">Assignments</h1>
                    <p className="text-muted-foreground">Manage vehicle-to-client assignments</p>
                </div>
                <Button
                    onClick={() => setAssignModalOpen(true)}
                    data-testid="button-create-assignment"
                    disabled={availableVehicles.length === 0 || availableClients.length === 0}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Successfully completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cancelled}</div>
                        <p className="text-xs text-muted-foreground">Cancelled assignments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by client, vehicle plate, or model..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                            data-testid="input-search-assignments"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Assignment List */}
                <div className="text-sm text-muted-foreground">
                    Showing {filteredAssignments.length} of {assignments.length} assignments
                </div>

                {filteredAssignments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No assignments found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {assignments.length === 0
                                    ? "Create your first assignment to get started"
                                    : "Try adjusting your search or filters"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredAssignments.map((assignment) => (
                            <Card key={assignment.id} className="hover-elevate">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {assignment.clientName}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Car className="h-4 w-4" />
                                                {assignment.vehicleModel} ({assignment.vehiclePlate})
                                            </CardDescription>
                                        </div>
                                        <Badge variant={getStatusVariant(assignment.status)} className="flex items-center gap-1">
                                            {getStatusIcon(assignment.status)}
                                            {assignment.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {format(new Date(assignment.startDate), "MMM dd, yyyy")}
                                            {assignment.endDate && ` - ${format(new Date(assignment.endDate), "MMM dd, yyyy")}`}
                                        </span>
                                    </div>
                                    {assignment.notes && (
                                        <div className="text-sm">
                                            <span className="font-medium">Notes: </span>
                                            <span className="text-muted-foreground">{assignment.notes}</span>
                                        </div>
                                    )}
                                    {assignment.status === "active" && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => completeAssignmentMutation.mutate(assignment.id)}
                                                disabled={completeAssignmentMutation.isPending}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Complete
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => cancelAssignmentMutation.mutate(assignment.id)}
                                                disabled={cancelAssignmentMutation.isPending}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Assignment Modal */}
            {availableVehicles.length > 0 && (
                <StepByStepAssignmentModal
                    open={assignModalOpen}
                    onOpenChange={setAssignModalOpen}
                    vehicleInfo={availableVehicles[0]}
                    onAssign={handleCreateAssignment}
                />
            )}
        </div>
    );
}
