import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientWithAssignment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddClientMultiStep } from "@/components/fleet/AddClientMultiStep";

export default function ClientsPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const [addClientOpen, setAddClientOpen] = useState(false);

    const { data: clients = [], isLoading } = useQuery<ClientWithAssignment[]>({
        queryKey: ["/api/clients"],
    });

    const filteredClients = clients.filter((client) => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchQuery.toLowerCase()) ||
            client.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.phone.includes(searchQuery);
        const matchesType = typeFilter === "all" || client.type === typeFilter;
        const matchesAvailability =
            availabilityFilter === "all" ||
            (availabilityFilter === "available" && client.available) ||
            (availabilityFilter === "assigned" && !client.available);
        return matchesSearch && matchesType && matchesAvailability;
    });

    const stats = {
        total: clients.length,
        available: clients.filter((c) => c.available).length,
        assigned: clients.filter((c) => !c.available).length,
    };

    const handleClientAdded = () => {
        toast({
            title: "Client Added",
            description: "New client has been added to the system",
        });
    };

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
                <div className="flex gap-3">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Clients</h1>
                    <p className="text-muted-foreground">
                        {stats.total} clients ({stats.available} available, {stats.assigned} assigned)
                    </p>
                </div>
                <Button onClick={() => setAddClientOpen(true)} data-testid="button-add-client">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        data-testid="input-search-clients"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-type-filter">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="existing">Existing</SelectItem>
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

            {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No clients found</p>
                    <p className="text-muted-foreground">
                        {clients.length === 0
                            ? "Add your first client to get started"
                            : "Try adjusting your search or filters"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <Card key={client.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{client.firstName} {client.lastName}</span>
                                    <Badge variant={client.available ? "default" : "secondary"}>
                                        {client.available ? "Available" : "Assigned"}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">CIN:</span> {client.cin}
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Type:</span>{" "}
                                    <Badge variant="outline">{client.type}</Badge>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Location:</span> {client.location}
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Phone:</span> {client.phone}
                                </div>
                                {client.assignedVehicle && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Vehicle:</span> {client.assignedVehicle}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AddClientMultiStep
                open={addClientOpen}
                onOpenChange={setAddClientOpen}
                onSuccess={handleClientAdded}
            />
        </div>
    );
}
