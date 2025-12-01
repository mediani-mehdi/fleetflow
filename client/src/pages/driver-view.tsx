import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockCurrentAssignment = {
  vehicleLicensePlate: "ABC-1234",
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleType: "sedan",
  assignedDate: new Date("2024-11-15"),
  location: "Downtown HQ - Lot A, Space 42",
  notes: "Regular maintenance completed on Nov 14. Please check tire pressure before long trips. Gas card is in the glove compartment.",
};

const mockPastAssignments = [
  {
    id: "1",
    vehiclePlate: "XYZ-5678",
    vehicleModel: "Ford Explorer",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-10-15"),
  },
  {
    id: "2",
    vehiclePlate: "DEF-9012",
    vehicleModel: "Chevrolet Silverado",
    startDate: new Date("2024-09-10"),
    endDate: new Date("2024-09-28"),
  },
  {
    id: "3",
    vehiclePlate: "JKL-7890",
    vehicleModel: "Tesla Model 3",
    startDate: new Date("2024-08-15"),
    endDate: new Date("2024-09-05"),
  },
];

export default function DriverViewPage() {
  const { toast } = useToast();
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

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

  return (
    <>
      <DriverAssignmentView
        driverName="John Smith"
        currentAssignment={mockCurrentAssignment}
        pastAssignments={mockPastAssignments}
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
