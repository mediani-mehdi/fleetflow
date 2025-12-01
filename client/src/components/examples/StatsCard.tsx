import { StatsCard } from "../fleet/StatsCard";
import { Car, CheckCircle, Users, Wrench } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Vehicles"
        value={48}
        icon={Car}
        description="Fleet size"
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Available"
        value={22}
        icon={CheckCircle}
        description="Ready for assignment"
      />
      <StatsCard
        title="Active Drivers"
        value={35}
        icon={Users}
        description="Currently assigned"
      />
      <StatsCard
        title="In Maintenance"
        value={4}
        icon={Wrench}
        description="Under service"
      />
    </div>
  );
}
