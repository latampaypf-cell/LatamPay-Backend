export interface Balance {
  currency_code: string;
  amount: number;
}

export interface Wallet {
  id: string;
  user_id: string;
  cbu: string;
  alias: string;
  balances?: Balance[];
}

export interface RecipientInfo {
  name: string;
  cbu: string;
  alias: string;
}
