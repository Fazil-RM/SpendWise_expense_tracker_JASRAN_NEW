import { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly";
  startDate: string;
  lastProcessedDate?: string;
}

export interface UserDetails {
  name: string;
  email: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  type: string; // e.g., Stocks, Mutual Funds, Crypto
  date: string;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Food", "Rent", "Transport", "Entertainment", "Shopping", "Health", "Other"
];

export const INCOME_CATEGORIES = [
  "Office", "Freelance", "Gift", "Other"
];

export const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#64748b"
];

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
];
