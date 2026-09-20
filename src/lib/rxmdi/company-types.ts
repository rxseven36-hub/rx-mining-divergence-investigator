export type Metric = {
  value: string;
  label: string;
  period?: string;
};

export type CompanyDestination = {
  country: string;
  volume: string;
};

export type Company360 = {
  symbol: string;
  name: string;
  industry: string;
  sector: string;
  commodity: string;
  board: string;
  description: string;

  price: {
    value: string;
    asOf: string;
  };

  marketCap: {
    value: string;
    asOf: string;
  };

  operation: {
    production: Metric;
    sales: Metric;
    reserves: Metric;
    resources: Metric;
  };

  financial: {
    revenue: Metric;
    profit: Metric;
    margin: Metric;
    assets: Metric;
  };

  destinations: CompanyDestination[];

  ownership: {
    shareholders: Array<{
      name: string;
      stake: string;
    }>;
    subsidiaries: Array<{
      name: string;
      stake: string;
    }>;
  };
};
