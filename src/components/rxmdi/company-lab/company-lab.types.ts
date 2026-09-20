export type BumiCompanyLabData = {
  ticker: string;
  symbol: string;
  name: string;
  commodity: string;
  subtype: string;
  year: number;
  production: number;
  sales: number;
  overburden: number;
  stripRatio: number;
  reserves: number;
  resources: number;
  siteCount: number;
};

export type BumiHistoryPoint = {
  year: number;
  production: number | null;
  sales: number | null;
  overburden: number | null;
  stripRatio: number | null;
};

export type BumiMineSite = {
  slug: string | null;
  name: string;
  operator: string;
  province: string | null;
  year: number | null;
  production: number | null;
  overburden: number | null;
  stripRatio: number | null;
  reserves: number | null;
  resources: number | null;
};

export type BumiCoalProduct = {
  name: string;
  calorificMin: number | null;
  calorificMax: number | null;
  moistureMin: number | null;
  moistureMax: number | null;
  ashMin: number | null;
  ashMax: number | null;
  sulphurMin: number | null;
  sulphurMax: number | null;
};

export type BumiSalesDestination = {
  country: string;
  volume: number;
  unit: string;
  commodity: string;
};
