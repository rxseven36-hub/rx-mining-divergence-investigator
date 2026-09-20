import type { Company360 } from "./company-types";

export const goldenCompanies: Record<string, Company360> = {
  BUMI: {
    symbol: "BUMI",
    name: "PT Bumi Resources Tbk",
    industry: "Coal",
    sector: "Energy",
    commodity: "Thermal Coal",
    board: "Main Board",

    description:
      "Follow BUMI from coal production and sales into export markets, financial performance, ownership, and stock-market activity.",

    price: {
      value: "Rp212",
      asOf: "10 Sep 2026",
    },

    marketCap: {
      value: "Rp78.72T",
      asOf: "10 Sep 2026",
    },

    operation: {
      production: {
        label: "Production",
        value: "74.7 Mt",
        period: "2024",
      },
      sales: {
        label: "Sales",
        value: "75.8 Mt",
        period: "2024",
      },
      reserves: {
        label: "Reserves",
        value: "2.354 Bt",
        period: "Measured 2024",
      },
      resources: {
        label: "Resources",
        value: "6.817 Bt",
        period: "Measured 2024",
      },
    },

    financial: {
      revenue: {
        label: "Revenue",
        value: "US$1.36B",
        period: "2024",
      },
      profit: {
        label: "Net profit",
        value: "US$90M",
        period: "2024",
      },
      margin: {
        label: "Net margin",
        value: "6.6%",
        period: "Derived · 2024",
      },
      assets: {
        label: "Assets",
        value: "US$4.16B",
        period: "2024",
      },
    },

    destinations: [
      { country: "Indonesia", volume: "23.07 Mt" },
      { country: "China", volume: "21.26 Mt" },
      { country: "India", volume: "12.77 Mt" },
      { country: "Japan", volume: "5.66 Mt" },
      { country: "Philippines", volume: "3.45 Mt" },
      { country: "Taiwan", volume: "2.46 Mt" },
    ],

    ownership: {
      shareholders: [
        { name: "Public", stake: "54.21%" },
        { name: "Mach Energy (Hongkong) Limited", stake: "45.78%" },
      ],

      subsidiaries: [
        { name: "PT Arutmin Indonesia", stake: "90%" },
        { name: "PT Pendopo Energi Batubara", stake: "84.52%" },
        { name: "PT Kaltim Prima Coal", stake: "51%" },
        { name: "PT Bumi Resources Minerals Tbk", stake: "20.92%" },
      ],
    },
  },
};
