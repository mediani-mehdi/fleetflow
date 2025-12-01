import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, Calendar, MapPin, AlertTriangle, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CurrentAssignment {
  vehicleLicensePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  assignedDate: Date;
  location: string;
  notes?: string;
}

interface PastAssignment {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  startDate: Date;
  endDate: Date;
}

interface DriverAssignmentViewProps {
  driverName: string;
  currentAssignment?: CurrentAssignment;
  pastAssignments: PastAssignment[];
  onReportIssue?: () => void;
}

export function DriverAssignmentView({
  driverName,
  currentAssignment,
  pastAssignments,
  onReportIssue,
}: DriverAssignmentViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">FleetFlow</h1>
              <p className="text-xs text-muted-foreground">Driver Portal</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{driverName}</span>
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">Current Assignment</h2>
          {currentAssignment ? (
            <Card className="overflow-hidden">
              <div className="bg-primary/5 p-6 text-center border-b">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <p className="text-4xl font-bold tracking-wider">
                  {currentAssignment.vehicleLicensePlate}
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  {currentAssignment.vehicleMake} {currentAssignment.vehicleModel}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {currentAssignment.vehicleType.toUpperCase()}
                </Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned Date</p>
                      <p className="font-medium">
                        {format(currentAssignment.assignedDate, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pick-up Location</p>
                      <p className="font-medium">{currentAssignment.location}</p>
                    </div>
                  </div>
                </div>
                {currentAssignment.notes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm">{currentAssignment.notes}</p>
                      </div>
                    </div>
                  </>
                )}
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={onReportIssue}
                  data-testid="button-report-issue"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                  <Car className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">No Active Assignment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You currently don't have a vehicle assigned to you.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Assignment History</h2>
          {pastAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No past assignments
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="hover-elevate"
                  data-testid={`card-past-assignment-${assignment.id}`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Car className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{assignment.vehiclePlate}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {assignment.vehicleModel}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(assignment.startDate, "MMM d")} -{" "}
                          {format(assignment.endDate, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
