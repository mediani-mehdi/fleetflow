import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MultiStepForm } from "@/components/ui/multi-step-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Client, ClientType } from "@shared/schema";

interface AddClientMultiStepProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddClientMultiStep({ open, onOpenChange, onSuccess }: AddClientMultiStepProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [cin, setCin] = useState("");
    const [existingClient, setExistingClient] = useState<Client | null>(null);
    const [cinChecked, setCinChecked] = useState(false);

    const [clientData, setClientData] = useState({
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

    const createClientMutation = useMutation({
        mutationFn: async (data: typeof clientData & { cin: string }) => {
            return apiRequest("/api/clients", { method: "POST", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            handleClose();
            onSuccess();
        },
    });

    const handleCinCheck = () => {
        const client = clients.find(c => c.cin.toLowerCase() === cin.toLowerCase());
        setExistingClient(client || null);
        setCinChecked(true);

        if (client) {
            // Client exists, show message and don't proceed
            return;
        } else {
            // Client doesn't exist, move to next step
            setCurrentStep(2);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            handleCinCheck();
        } else if (currentStep === 2) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Create client
            createClientMutation.mutate({
                ...clientData,
                cin,
            });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            if (currentStep === 2) {
                setCinChecked(false);
                setExistingClient(null);
            }
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setCurrentStep(1);
            setCin("");
            setExistingClient(null);
            setCinChecked(false);
            setClientData({
                firstName: "",
                lastName: "",
                type: "new",
                location: "",
                phone: "",
                cinImage: "",
            });
        }, 300);
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Check Client CIN";
            case 2: return "Client Information";
            case 3: return "Review & Confirm";
            default: return "Add Client";
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 1: return "Enter the client's CIN to check if they already exist in the system";
            case 2: return "Fill in the client's personal information";
            case 3: return "Review the information before adding the client";
            default: return "";
        }
    };

    const isNextDisabled = () => {
        if (currentStep === 1) {
            return !cin || (cinChecked && !!existingClient);
        } else if (currentStep === 2) {
            return !clientData.firstName || !clientData.lastName || !clientData.phone || !clientData.location;
        }
        return false;
    };

    const getNextButtonText = () => {
        if (currentStep === 1) return cinChecked && !existingClient ? "Continue" : "Check CIN";
        if (currentStep === 2) return "Review";
        return createClientMutation.isPending ? "Creating..." : "Create Client";
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <MultiStepForm
                currentStep={currentStep}
                totalSteps={3}
                title={getStepTitle()}
                description={getStepDescription()}
                onBack={handleBack}
                onNext={handleNext}
                onClose={handleClose}
                nextButtonText={getNextButtonText()}
                nextDisabled={isNextDisabled()}
                size="sm"
            >
                {/* Step 1: CIN Check */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cin">Client CIN (ID Number) *</Label>
                            <Input
                                id="cin"
                                placeholder="AB123456"
                                value={cin}
                                onChange={(e) => {
                                    setCin(e.target.value.toUpperCase());
                                    setCinChecked(false);
                                    setExistingClient(null);
                                }}
                                onKeyDown={(e) => e.key === "Enter" && cin && !cinChecked && handleCinCheck()}
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                We'll check if this CIN already exists in the system
                            </p>
                        </div>

                        {cinChecked && existingClient && (
                            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800">
                                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                <AlertDescription>
                                    <strong>Client already exists!</strong>
                                    <div className="mt-2 space-y-1">
                                        <div>Name: {existingClient.firstName} {existingClient.lastName}</div>
                                        <div>Phone: {existingClient.phone}</div>
                                        <div>Location: {existingClient.location}</div>
                                    </div>
                                    <p className="mt-2 text-xs">This client is already registered in the system.</p>
                                </AlertDescription>
                            </Alert>
                        )}

                        {cinChecked && !existingClient && (
                            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertDescription>
                                    CIN is available! Click "Continue" to add this new client.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                {/* Step 2: Client Information */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm font-medium">New Client</p>
                            <p className="text-xs text-muted-foreground">CIN: {cin}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="clientType">Client Type *</Label>
                                <Select
                                    value={clientData.type}
                                    onValueChange={(value) => setClientData({ ...clientData, type: value as ClientType })}
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
                                        value={clientData.firstName}
                                        onChange={(e) => setClientData({ ...clientData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Smith"
                                        value={clientData.lastName}
                                        onChange={(e) => setClientData({ ...clientData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    placeholder="06 12 34 56 78"
                                    value={clientData.phone}
                                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Select
                                    value={clientData.location}
                                    onValueChange={(value) => setClientData({ ...clientData, location: value })}
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
                                                setClientData({ ...clientData, cinImage: base64String });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {clientData.cinImage && (
                                    <div className="mt-2 p-2 border rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                        <img
                                            src={clientData.cinImage}
                                            alt="CIN Preview"
                                            className="max-w-full h-32 object-contain rounded"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4 space-y-3">
                            <h3 className="font-medium">Client Information</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">CIN:</span>
                                    <p className="font-medium">{cin}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Type:</span>
                                    <p className="font-medium capitalize">{clientData.type}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">First Name:</span>
                                    <p className="font-medium">{clientData.firstName}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Last Name:</span>
                                    <p className="font-medium">{clientData.lastName}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Phone:</span>
                                    <p className="font-medium">{clientData.phone}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Location:</span>
                                    <p className="font-medium">{clientData.location}</p>
                                </div>
                            </div>
                        </div>

                        <Alert>
                            <AlertDescription>
                                Please review the information above. Click "Create Client" to add this client to the system.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </MultiStepForm>
        </div>
    );
}
