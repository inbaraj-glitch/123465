/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, Filter, Edit, Tag, HelpCircle } from "lucide-react";
import { Transaction } from "../types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRecategorize: (id: string, category: string) => void;
}

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transport",
  "Entertainment",
  "Housing",
  "Income",
  "Investments",
  "Utilities",
  "Credit Card Payment",
  "Healthcare",
  "Others",
];

export default function RecentTransactions({ transactions, onRecategorize }: RecentTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredTransactions = transactions
    .filter((t) => {
      const matchesSearch =
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 glass-card space-y-6 select-none">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-100">Cleaned Bank Ledger</h3>
          <p className="text-[11px] text-gray-400">Live transactions imported, sanitized, and categorized</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Cashflow</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Merchant Description</th>
              <th className="py-3 px-4">Category Classification</th>
              <th className="py-3 px-4 text-right">Cashflow Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <tr key={tx.id} className="text-xs hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3.5 px-4 text-gray-300 font-mono">{tx.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <span className="font-semibold text-gray-100 truncate max-w-[200px]">{tx.merchant}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {editingId === tx.id ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={tx.category}
                          onChange={(e) => {
                            onRecategorize(tx.id, e.target.value);
                            setEditingId(null);
                          }}
                          className="px-2 py-1 bg-slate-950 border border-white/10 rounded-lg text-xs text-white"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] text-gray-400 hover:text-white underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-300">{tx.category}</span>
                        <button
                          onClick={() => setEditingId(tx.id)}
                          className="p-1 rounded text-gray-400 hover:text-emerald-400 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                          title="Recategorize"
                        >
                          <Edit size={10} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold font-mono ${isIncome ? "text-emerald-400" : "text-gray-100"}`}>
                    {isIncome ? "+" : "-"} {formatRupee(tx.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wide">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold bg-white/5 px-2 py-0.5 rounded">
                      {tx.source === "upload" ? "Auto-Cleaned" : "Manual"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <HelpCircle className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No transactions match your search</p>
                  <p className="text-xs mt-1">Try resetting filters or upload a bank statement.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
