export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: Date;
}

export interface ExchangeHistory {
  rate: number;
  created_at: Date;
}
