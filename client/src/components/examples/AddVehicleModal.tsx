import { useState } from "react";
import { AddVehicleModal } from "../fleet/AddVehicleModal";
import { Button } from "@/components/ui/button";

export default function AddVehicleModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)} data-testid="button-open-add-vehicle">
        Add Vehicle
      </Button>
      <AddVehicleModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => {
          console.log("Vehicle added:", data);
        }}
      />
    </div>
  );
}
