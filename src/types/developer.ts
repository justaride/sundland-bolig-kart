export type Developer = {
  orgNumber: string;
  name: string;
  address: string | null;
  industry: string | null;
  employees: number | null;
  financials: any | null;
  roles: { name: string; role: string }[];
  shareholders: { name: string; percentage: number; type: string }[];
};
