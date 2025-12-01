import { StatusBadge } from "../fleet/StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="available" />
      <StatusBadge status="assigned" />
      <StatusBadge status="maintenance" />
      <StatusBadge status="out_of_service" />
    </div>
  );
}
