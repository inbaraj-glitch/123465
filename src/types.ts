/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  premiumBadge: boolean;
  memberSince: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
  source: 'manual' | 'upload';
  month: string; // e.g. "2026-07"
  year: number;
  quarter: number;
  week: number;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
}

export interface Bill {
  id: string;
  userId: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'paid' | 'unpaid' | 'overdue';
}

export interface InvestmentProfile {
  id: string;
  userId: string;
  age: number;
  monthlySavings: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  investmentGoal: string;
  emergencyFundMonths: number;
  durationYears: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export interface FinancialHealth {
  score: number;
  status: 'Poor' | 'Average' | 'Good' | 'Excellent';
  savingsRate: number;
  expenseRatio: number;
  debtRatio: number;
  budgetDiscipline: number;
  emergencyFundStatus: string;
  tips: string[];
}

export interface AIInsight {
  id: string;
  type: 'alert' | 'saving' | 'recommendation' | 'general';
  title: string;
  description: string;
  amount?: number;
}
