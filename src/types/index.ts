export interface Profile {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
  preferred_currency: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
  last_seen?: string | null;
}

export type TransactionType = "entrada" | "saida";
export type RecurrenceType = "mensal" | "semanal" | "anual";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  budgetPercentage?: number;
}

export interface Card {
  id: string;
  name: string;
  color?: string;
  closingDate: number; // Day of the month (1-31)
  dueDate: number; // Day of the month (1-31)
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  recurrenceType: RecurrenceType;
  startDate: string; // ISO string
  status: "active" | "paused";
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  description: string;
  categoryId: string;
  notes?: string;
  isPlanned?: boolean;
  cardId?: string; // If it's a card transaction
  installmentIndex?: number; // e.g., 1 for 1/3
  installmentCount?: number; // e.g., 3 for 1/3
  installmentGroupId?: string; // To group installments together
  recurringTransactionId?: string; // If generated from a recurring transaction
}

export interface DailyBalance {
  date: string;
  income: number;
  expense: number;
  balance: number;
  runningBalance: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  created_at?: string | null;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  contributionDate: string;
  notes?: string;
  created_at?: string | null;
}
