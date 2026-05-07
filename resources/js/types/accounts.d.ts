export type AccountType = 'checking' | 'savings' | 'wallet' | 'investment' | 'other'

export interface AccountRow {
  id: number
  name: string
  type: AccountType
  balance: number
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string>

export type TransactionType = 'debit' | 'credit'

export interface TransactionRow {
  id: number
  type: TransactionType | 'transfer_out' | 'transfer_in'
  amount: number
  description: string
  date: string
  transfer_id?: string | null
}
