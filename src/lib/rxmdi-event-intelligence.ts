import eventIntelligence from "./rxmdi-event-intelligence.json";

export type RxMdiDimension = {
  name: string;
  score: number;
};

export type RxMdiNewsEvent = {
  id: string;
  type: "news";
  timestamp: string;
  date: string;
  title: string;
  summary: string;
  sourceUrl: string;
  publisher: string;
  symbols: string[];
  dimensions: RxMdiDimension[];
  thumbnail: string | null;
};

export type RxMdiFilingEvent = {
  id: string;
  type: "filing";
  timestamp: string;
  date: string;
  title: string;
  summary: string;
  sourceUrl: string;
  publisher: string;
  symbol: string;
  transactionType: string | null;
  holderType: string | null;
  holderName: string | null;
  holdingBefore: number | null;
  holdingAfter: number | null;
  amountTransaction: number | null;
  price: number | null;
  transactionValue: number | null;
  sharePercentageBefore: number | null;
  sharePercentageAfter: number | null;
  sharePercentageTransaction: number | null;
  priceTransactions: Array<Record<string, unknown>>;
};

export const rxMdiEventIntelligence = eventIntelligence;
export default rxMdiEventIntelligence;
