import type { Developer } from "../../../types/developer";
import type { DrillDownData } from "../../../types/plaace";
import ChartCard from "../../ui/ChartCard";
import DataTable from "../../ui/DataTable";
import developers from "../../../data/developers.json";
import { formatNumber } from "../../../utils/format";

const typedDevelopers = developers as Developer[];

type Props = {
  onDrillDown: (data: DrillDownData) => void;
};

const columns = [
  {
    key: "name",
    label: "Navn",
    render: (d: Developer) => <span className="font-medium">{d.name}</span>,
    sortValue: (d: Developer) => d.name,
  },
  {
    key: "orgNumber",
    label: "Org.nr",
    render: (d: Developer) => <span className="text-gray-500 tabular-nums">{d.orgNumber}</span>,
  },
  {
    key: "industry",
    label: "Bransje",
    render: (d: Developer) => <span className="text-xs text-gray-500">{d.industry}</span>,
  },
  {
    key: "employees",
    label: "Ansatte",
    render: (d: Developer) => d.employees ? formatNumber(d.employees) : "–",
    sortValue: (d: Developer) => d.employees ?? 0,
    align: "right" as const,
  },
  {
    key: "revenue",
    label: "Omsetning (2024)",
    render: (d: Developer) => {
      const rev = d.financials?.resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter;
      if (!rev) return "–";
      return `${Math.round(rev / 1000000)} mill.`;
    },
    sortValue: (d: Developer) => d.financials?.resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter ?? 0,
    align: "right" as const,
  }
];

export default function DeveloperTab({ onDrillDown }: Props) {
  return (
    <div className="space-y-6">
      <ChartCard title="Utviklere (Beriket fra OffentligData / Brreg)">
        <DataTable
          data={typedDevelopers}
          columns={columns}
          onRowClick={(d) =>
            onDrillDown({
              type: "developer",
              payload: d as unknown as Record<string, unknown>,
            })
          }
          pageSize={12}
        />
      </ChartCard>
      
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
        <p>
          <strong>Merk:</strong> Denne oversikten er automatisk beriket med sanntidsdata fra OffentligData.com MCP-serveren. 
          Den inkluderer offisielle regnskapstall for 2024, styremedlemmer og aksjonærinformasjon.
        </p>
      </div>
    </div>
  );
}
