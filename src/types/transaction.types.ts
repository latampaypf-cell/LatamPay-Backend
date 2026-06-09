export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'exchange';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  from_wallet_id?: string;
  to_wallet_id?: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate?: number;
  created_at: Date;
}
