import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AssignmentWithDetails } from "@shared/schema";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Calendar as CalendarIcon,
    Car,
    User,
    Clock,
    TrendingUp,
    FileText,
    CheckCircle,
    XCircle
} from "lucide-react";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: AssignmentWithDetails;
}

export default function CalendarPage() {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [view, setView] = useState<View>("month");
    const [date, setDate] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: assignments = [], isLoading } = useQuery<AssignmentWithDetails[]>({
        queryKey: ["/api/assignments"],
    });

    // Filter assignments by status
    const filteredAssignments = useMemo(() => {
        if (statusFilter === "all") return assignments;
        return assignments.filter(a => a.status === statusFilter);
    }, [assignments, statusFilter]);

    // Convert assignments to calendar events
    const events: CalendarEvent[] = useMemo(() =>
        filteredAssignments
            .filter((assignment) => assignment.startDate)
            .map((assignment) => ({
                id: assignment.id,
                title: `${assignment.vehiclePlate} - ${assignment.clientName}`,
                start: new Date(assignment.startDate!),
                end: assignment.endDate ? new Date(assignment.endDate) : new Date(assignment.startDate!),
                resource: assignment,
            })),
        [filteredAssignments]
    );

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        return {
            total: events.length,
            active: events.filter(e => e.resource.status === "active").length,
            thisMonth: events.filter(e =>
                isWithinInterval(e.start, { start: monthStart, end: monthEnd })
            ).length,
        };
    }, [events]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const isActive = event.resource.status === "active";
        const isCompleted = event.resource.status === "completed";
        const isCancelled = event.resource.status === "cancelled";

        let backgroundColor = "hsl(var(--primary))"; // blue for active
        if (isCompleted) backgroundColor = "#10b981"; // green
        if (isCancelled) backgroundColor = "#ef4444"; // red

        return {
            style: {
                backgroundColor,
                borderRadius: "6px",
                opacity: 0.9,
                color: "white",
                border: "none",
                display: "block",
                fontSize: "0.875rem",
                padding: "2px 6px",
            },
        };
    };

    const CustomEvent = ({ event }: { event: CalendarEvent }) => (
        <div className="flex items-center gap-1">
            <Car className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs font-medium truncate">{event.resource.vehiclePlate}</span>
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-[600px]" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Calendar</h1>
                    <p className="text-muted-foreground">
                        View and manage vehicle assignments
                    </p>
                </div>
                <Button onClick={() => setDate(new Date())} variant="outline">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Today
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.thisMonth}</div>
                        <p className="text-xs text-muted-foreground">Assignments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={view === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("month")}
                    >
                        Month
                    </Button>
                    <Button
                        variant={view === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("week")}
                    >
                        Week
                    </Button>
                    <Button
                        variant={view === "day" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("day")}
                    >
                        Day
                    </Button>
                    <Button
                        variant={view === "agenda" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("agenda")}
                    >
                        Agenda
                    </Button>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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

            {/* Legend */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--primary))" }} />
                            <span className="text-sm">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500" />
                            <span className="text-sm">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500" />
                            <span className="text-sm">Cancelled</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
                <CardContent className="p-6">
                    <div style={{ height: 600 }} className="calendar-container">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: "100%" }}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={(event) => setSelectedEvent(event)}
                            views={["month", "week", "day", "agenda"]}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            components={{
                                event: CustomEvent,
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Event Details Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assignment Details</DialogTitle>
                        <DialogDescription>
                            {selectedEvent && format(selectedEvent.start, "PPP")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Car className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Vehicle</p>
                                    <p className="font-medium">{selectedEvent.resource.vehiclePlate}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedEvent.resource.vehicleModel}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Client</p>
                                    <p className="font-medium">{selectedEvent.resource.clientName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="font-medium">
                                        {format(selectedEvent.start, "PPP")}
                                        {selectedEvent.resource.endDate && (
                                            <> - {format(new Date(selectedEvent.resource.endDate), "PPP")}</>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    {selectedEvent.resource.status === "active" && <Clock className="h-5 w-5 text-primary" />}
                                    {selectedEvent.resource.status === "completed" && <CheckCircle className="h-5 w-5 text-primary" />}
                                    {selectedEvent.resource.status === "cancelled" && <XCircle className="h-5 w-5 text-primary" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge
                                        variant={
                                            selectedEvent.resource.status === "active"
                                                ? "default"
                                                : selectedEvent.resource.status === "completed"
                                                    ? "secondary"
                                                    : "destructive"
                                        }
                                    >
                                        {selectedEvent.resource.status}
                                    </Badge>
                                </div>
                            </div>

                            {selectedEvent.resource.notes && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm">{selectedEvent.resource.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <style>{`
                .calendar-container .rbc-calendar {
                    font-family: inherit;
                }
                
                .calendar-container .rbc-event {
                    padding: 2px 5px;
                }
                
                .calendar-container .rbc-today {
                    background-color: hsl(var(--primary) / 0.1);
                }
                
                .calendar-container .rbc-header {
                    padding: 12px 6px;
                    font-weight: 600;
                    border-bottom: 2px solid hsl(var(--border));
                    font-size: 0.875rem;
                }
                
                .calendar-container .rbc-month-view {
                    border: 1px solid hsl(var(--border));
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .calendar-container .rbc-day-bg {
                    border-left: 1px solid hsl(var(--border));
                }
                
                .calendar-container .rbc-month-row {
                    border-top: 1px solid hsl(var(--border));
                }
                
                .calendar-container .rbc-off-range-bg {
                    background-color: hsl(var(--muted) / 0.3);
                }
                
                .calendar-container .rbc-event:hover {
                    opacity: 1;
                }
                
                .calendar-container .rbc-toolbar {
                    padding: 12px 0;
                    margin-bottom: 16px;
                }
                
                .calendar-container .rbc-toolbar button {
                    color: hsl(var(--foreground));
                    border: 1px solid hsl(var(--border));
                    padding: 6px 12px;
                    border-radius: 6px;
                    background-color: hsl(var(--background));
                }
                
                .calendar-container .rbc-toolbar button:hover {
                    background-color: hsl(var(--accent));
                }
                
                .calendar-container .rbc-toolbar button.rbc-active {
                    background-color: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }
            `}</style>
        </div>
    );
}
