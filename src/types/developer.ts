export type Developer = {
  orgNumber: string;
  name: string;
  address: string | null;
  industry: string | null;
  employees: number | null;
  financials: {
    revenue: number | null;
    operatingResult: number | null;
    year: number;
  } | null;
  roles: { name: string; role: string }[];
  shareholders: { name: string; share: number }[];
};
