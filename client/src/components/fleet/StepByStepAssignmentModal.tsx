import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ArrowLeft, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Client, ClientType } from "@shared/schema";

interface StepByStepAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleInfo: {
        id: string;
        licensePlate: string;
        make: string;
        model: string;
    };
    onAssign: (data: { vehicleId: string; clientId: string; notes: string; startDate?: Date; endDate?: Date }) => void;
}

type Step = "cin" | "client-info" | "confirm";

export function StepByStepAssignmentModal({
    open,
    onOpenChange,
    vehicleInfo,
    onAssign,
}: StepByStepAssignmentModalProps) {
    const [step, setStep] = useState<Step>("cin");
    const [cin, setCin] = useState("");
    const [existingClient, setExistingClient] = useState<Client | null>(null);
    const [checkingCin, setCheckingCin] = useState(false);
    const [notes, setNotes] = useState("");

    // New client form data
    const [newClientData, setNewClientData] = useState({
        firstName: "",
        lastName: "",
        type: "new" as ClientType,
        location: "",
        phone: "",
        cinImage: "",
    });

    const { data: clients = [] } = useQuery<Client[]>({
        queryKey: ["/api/clients"],
    });

    const handleCinCheck = async () => {
        setCheckingCin(true);

        // Check if client with this CIN exists
        const client = clients.find(c => c.cin.toLowerCase() === cin.toLowerCase());

        if (client) {
            // Client exists - go directly to confirmation
            setExistingClient(client);
            setStep("confirm");
        } else {
            // Client doesn't exist - go to client info form
            setExistingClient(null);
            setStep("client-info");
        }

        setCheckingCin(false);
    };

    const handleCreateAndAssign = async () => {
        try {
            // Create new client
            const newClient = await apiRequest("/api/clients", {
                method: "POST",
                body: JSON.stringify({
                    ...newClientData,
                    cin,
                }),
            }) as unknown as Client;

            // Assign vehicle to new client
            onAssign({
                vehicleId: vehicleInfo.id,
                clientId: newClient.id,
                notes,
            });

            handleClose();
        } catch (error) {
            console.error("Error creating client:", error);
        }
    };

    const handleAssignExisting = () => {
        if (existingClient) {
            onAssign({
                vehicleId: vehicleInfo.id,
                clientId: existingClient.id,
                notes,
            });
            handleClose();
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state
        setTimeout(() => {
            setStep("cin");
            setCin("");
            setExistingClient(null);
            setNotes("");
            setNewClientData({
                firstName: "",
                lastName: "",
                type: "new",
                location: "",
                phone: "",
                cinImage: "",
            });
        }, 300);
    };

    const handleBack = () => {
        if (step === "client-info") {
            setStep("cin");
        } else if (step === "confirm") {
            if (existingClient) {
                setStep("cin");
            } else {
                setStep("client-info");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assign Vehicle - Step {step === "cin" ? "1" : step === "client-info" ? "2" : "3"} of 3</DialogTitle>
                    <DialogDescription>
                        Assign {vehicleInfo.make} {vehicleInfo.model} ({vehicleInfo.licensePlate})
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 py-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === "cin" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>
                        {step !== "cin" ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                    </div>
                    <div className="w-12 h-0.5 bg-border" />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === "client-info" ? "bg-primary text-primary-foreground" : step === "confirm" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {step === "confirm" ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                    </div>
                    <div className="w-12 h-0.5 bg-border" />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        3
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Step 1: CIN Input */}
                    {step === "cin" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="cin">Enter Client CIN (ID Number) *</Label>
                                <Input
                                    id="cin"
                                    placeholder="AB123456"
                                    value={cin}
                                    onChange={(e) => setCin(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === "Enter" && cin && handleCinCheck()}
                                    data-testid="input-cin-check"
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll check if this client already exists in the system
                                </p>
                            </div>
                        </>
                    )}

                    {/* Step 2: Client Information (for new clients) */}
                    {step === "client-info" && (
                        <>
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm font-medium">New Client</p>
                                <p className="text-xs text-muted-foreground">CIN: {cin} - Not found in system</p>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="clientType">Client Type *</Label>
                                    <Select
                                        value={newClientData.type}
                                        onValueChange={(value) => setNewClientData({ ...newClientData, type: value as ClientType })}
                                    >
                                        <SelectTrigger id="clientType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New Client</SelectItem>
                                            <SelectItem value="existing">Existing Client</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            value={newClientData.firstName}
                                            onChange={(e) => setNewClientData({ ...newClientData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Smith"
                                            value={newClientData.lastName}
                                            onChange={(e) => setNewClientData({ ...newClientData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="06 12 34 56 78"
                                        value={newClientData.phone}
                                        onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Select
                                        value={newClientData.location}
                                        onValueChange={(value) => setNewClientData({ ...newClientData, location: value })}
                                    >
                                        <SelectTrigger id="location">
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Casablanca">Casablanca</SelectItem>
                                            <SelectItem value="Rabat">Rabat</SelectItem>
                                            <SelectItem value="Marrakech">Marrakech</SelectItem>
                                            <SelectItem value="Tangier">Tangier</SelectItem>
                                            <SelectItem value="Agadir">Agadir</SelectItem>
                                            <SelectItem value="Fes">Fes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cinImage">CIN Image (Optional)</Label>
                                    <Input
                                        id="cinImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    const base64String = reader.result as string;
                                                    setNewClientData({ ...newClientData, cinImage: base64String });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {newClientData.cinImage && (
                                        <div className="mt-2 p-2 border rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                            <img
                                                src={newClientData.cinImage}
                                                alt="CIN Preview"
                                                className="max-w-full h-32 object-contain rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === "confirm" && (
                        <>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {existingClient
                                                        ? `${existingClient.firstName} ${existingClient.lastName}`
                                                        : `${newClientData.firstName} ${newClientData.lastName}`}
                                                </p>
                                                <Badge variant="outline">
                                                    {existingClient ? existingClient.type : newClientData.type}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div>CIN: {cin}</div>
                                                <div>Phone: {existingClient ? existingClient.phone : newClientData.phone}</div>
                                                <div>Location: {existingClient ? existingClient.location : newClientData.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Assignment Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes about this assignment..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="flex-row gap-2">
                    {step !== "cin" && (
                        <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}

                    {step === "cin" && (
                        <Button
                            onClick={handleCinCheck}
                            disabled={!cin || checkingCin}
                            className="flex-1"
                        >
                            {checkingCin ? "Checking..." : "Next"}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}

                    {step === "client-info" && (
                        <Button
                            onClick={() => setStep("confirm")}
                            disabled={!newClientData.firstName || !newClientData.lastName || !newClientData.phone || !newClientData.location}
                            className="flex-1"
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}

                    {step === "confirm" && (
                        <Button
                            onClick={existingClient ? handleAssignExisting : handleCreateAndAssign}
                            className="flex-1"
                        >
                            {existingClient ? "Assign Vehicle" : "Create & Assign"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
