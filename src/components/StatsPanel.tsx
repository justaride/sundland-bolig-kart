import type { Property } from "../types/property";
import DashboardTabs from "./dashboard/DashboardTabs";

type Props = {
  properties: Property[];
};

export default function StatsPanel({ properties }: Props) {
  return <DashboardTabs properties={properties} />;
}
