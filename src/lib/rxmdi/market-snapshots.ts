export type BrokerFlow = {
  code: string;
  net: string;
};

export type MarketSnapshot = {
  symbol: string;

  period: {
    start: string;
    end: string;
    tradingDays: number;
  };

  price: {
    start: string;
    latest: string;
    change: string;
    latestAsOf: string;
  };

  volume: {
    average: string;
    peak: string;
    peakDate: string;
  };

  foreignFlow: {
    net: string;
    positiveDays: number;
    negativeDays: number;
    largestBuy: string;
    largestBuyDate: string;
    largestSell: string;
    largestSellDate: string;
  };

  brokerWindow: {
    start: string;
    end: string;
  };

  buyers: BrokerFlow[];
  sellers: BrokerFlow[];
};

export const marketSnapshots: Record<string, MarketSnapshot> = {
  BUMI: {
    symbol: "BUMI",

    period: {
      start: "12 Aug 2026",
      end: "10 Sep 2026",
      tradingDays: 20,
    },

    price: {
      start: "Rp185",
      latest: "Rp212",
      change: "+14.59%",
      latestAsOf: "10 Sep 2026",
    },

    volume: {
      average: "3.266B",
      peak: "6.993B",
      peakDate: "1 Sep 2026",
    },

    foreignFlow: {
      net: "+Rp143.58B",
      positiveDays: 10,
      negativeDays: 9,
      largestBuy: "+Rp98.72B",
      largestBuyDate: "10 Sep 2026",
      largestSell: "-Rp67.49B",
      largestSellDate: "8 Sep 2026",
    },

    brokerWindow: {
      start: "28 Aug 2026",
      end: "10 Sep 2026",
    },

    buyers: [
      { code: "AK", net: "+Rp122.89B" },
      { code: "LG", net: "+Rp83.46B" },
      { code: "SS", net: "+Rp65.84B" },
      { code: "YP", net: "+Rp34.30B" },
      { code: "PD", net: "+Rp26.60B" },
    ],

    sellers: [
      { code: "XL", net: "-Rp86.65B" },
      { code: "CC", net: "-Rp58.36B" },
      { code: "IF", net: "-Rp48.36B" },
      { code: "YB", net: "-Rp36.12B" },
      { code: "AZ", net: "-Rp34.69B" },
    ],
  },
};
