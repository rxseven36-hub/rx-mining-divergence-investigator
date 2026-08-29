export interface RXCompany {
  id: string;

  name: string;

  symbol?: string;

  sectorsSlug?: string;

  listed: boolean;

  exchange?: string;
}