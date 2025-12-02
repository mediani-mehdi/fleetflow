import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DriverAssignmentView } from "@/components/fleet/DriverAssignmentView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import type { DriverWithAssignment, AssignmentWithDetails } from "@shared/schema";

export default function DriverViewPage() {
  const { toast } = useToast();
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const { data: drivers = [], isLoading: driversLoading } = useQuery<DriverWithAssignment[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: assignments = [] } = useQuery<AssignmentWithDetails[]>({
    queryKey: ["/api/assignments"],
  });

  const activeDriver = selectedDriverId 
    ? drivers.find((d) => d.id === selectedDriverId) 
    : drivers.find((d) => !d.available);

  const currentAssignment = activeDriver 
    ? assignments.find((a) => a.driverId === activeDriver.id && a.status === "active")
    : null;

  const pastAssignments = activeDriver 
    ? assignments
        .filter((a) => a.driverId === activeDriver.id && a.status === "completed")
        .map((a) => ({
          id: a.id,
          vehiclePlate: a.vehiclePlate,
          vehicleModel: a.vehicleModel,
          startDate: new Date(a.startDate),
          endDate: a.endDate ? new Date(a.endDate) : undefined,
        }))
    : [];

  const handleReportIssue = () => {
    setIssueDialogOpen(true);
  };

  const handleSubmitIssue = () => {
    if (!issueType || !issueDescription) return;

    console.log("Issue reported:", { type: issueType, description: issueDescription });
    toast({
      title: "Issue Reported",
      description: "Your issue has been submitted to the fleet manager.",
    });
    setIssueDialogOpen(false);
    setIssueType("");
    setIssueDescription("");
  };

  if (driversLoading) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!activeDriver) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">No Active Assignment</h2>
          <p className="text-muted-foreground max-w-sm">
            {drivers.length === 0 
              ? "No drivers have been added to the system yet." 
              : "Select a driver to view their assignment details."}
          </p>
          {drivers.length > 0 && (
            <Select value={selectedDriverId || ""} onValueChange={setSelectedDriverId}>
              <SelectTrigger className="w-64 mx-auto" data-testid="select-driver">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} {driver.available ? "(Available)" : "(Assigned)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  }

  const currentAssignmentData = currentAssignment ? {
    vehicleLicensePlate: currentAssignment.vehiclePlate,
    vehicleMake: currentAssignment.vehicleModel.split(" ")[0],
    vehicleModel: currentAssignment.vehicleModel.split(" ").slice(1).join(" "),
    vehicleType: "sedan",
    assignedDate: new Date(currentAssignment.startDate),
    location: "Check vehicle location in your assignment details",
    notes: currentAssignment.notes || undefined,
  } : undefined;

  return (
    <>
      <DriverAssignmentView
        driverName={activeDriver.name}
        currentAssignment={currentAssignmentData}
        pastAssignments={pastAssignments}
        onReportIssue={handleReportIssue}
      />

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Describe the problem with your assigned vehicle. Our team will address it promptly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type *</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger id="issueType" data-testid="select-issue-type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mechanical">Mechanical Issue</SelectItem>
                  <SelectItem value="damage">Vehicle Damage</SelectItem>
                  <SelectItem value="maintenance">Maintenance Required</SelectItem>
                  <SelectItem value="fuel">Fuel/Charging Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDescription">Description *</Label>
              <Textarea
                id="issueDescription"
                placeholder="Please describe the issue in detail..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                data-testid="textarea-issue-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitIssue}
              disabled={!issueType || !issueDescription}
              data-testid="button-submit-issue"
            >
              Submit Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
