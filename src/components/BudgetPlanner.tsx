/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Compass, Sparkles, CheckCircle2, ShieldAlert, Plus, HelpCircle, Save } from "lucide-react";
import { Budget } from "../types";

interface BudgetPlannerProps {
  budgets: Budget[];
  onSaveBudget: (category: string, limitAmount: number) => void;
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

export default function BudgetPlanner({ budgets, onSaveBudget }: BudgetPlannerProps) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [limitInput, setLimitInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(limitInput);
    if (isNaN(limitNum) || limitNum <= 0) return;

    onSaveBudget(selectedCategory, limitNum);
    setSuccessMsg(`Budget limits for [${selectedCategory}] configured successfully!`);
    setLimitInput("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
      {/* Col 1: Add/Edit Budget Form */}
      <div className="p-6 glass-card space-y-5 h-fit">
        <div>
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-blue-400" /> Budget Planner
          </h3>
          <p className="text-[11px] text-gray-400">Establish and customize monthly threshold category limits</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Limit Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-xs font-bold tracking-wider uppercase text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save size={14} /> Commit Category Limit
          </button>
        </form>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span className="text-[10px] font-semibold">{successMsg}</span>
          </div>
        )}
      </div>

      {/* Col 2-3: Budget Trackers Grid */}
      <div className="p-6 glass-card md:col-span-2 space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-100">Live Active Threshold Meters</h3>
          <p className="text-[11px] text-gray-400">Comparing real-time manual ledger and statements entries against goals</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const percentage = b.limitAmount > 0 ? Math.round((b.spentAmount / b.limitAmount) * 100) : 0;
            const isOver = b.spentAmount > b.limitAmount;
            const remaining = b.limitAmount - b.spentAmount;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOver ? "bg-red-500/5 border-red-500/15" : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5 mb-3">
                  <span className="font-semibold text-xs text-gray-200">{b.category}</span>
                  <span className={`text-[10px] font-bold ${isOver ? "text-red-400" : "text-emerald-400"}`}>
                    {percentage}%
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Spent Ledger</span>
                      <span className="font-bold text-gray-200 font-mono">{formatRupee(b.spentAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Limit</span>
                      <span className="font-bold text-gray-400 font-mono">{formatRupee(b.limitAmount)}</span>
                    </div>
                  </div>

                  {/* HTML Progress meter */}
                  <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isOver
                          ? "bg-gradient-to-r from-red-500 to-pink-600"
                          : percentage > 85
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-gradient-to-r from-blue-500 to-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  {/* Overdraft caution details */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">
                      {isOver ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <ShieldAlert size={10} /> Overdrafted by {formatRupee(Math.abs(remaining))}
                        </span>
                      ) : (
                        <span className="text-gray-400">Remaining: <span className="font-bold text-emerald-400 font-mono">{formatRupee(remaining)}</span></span>
                      )}
                    </span>
                    {percentage > 90 && !isOver && (
                      <span className="text-amber-400 font-bold animate-pulse">Critical Threshold Warning</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">
              <HelpCircle className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">No category limits set yet</p>
              <p className="text-xs mt-1">Configure categories on the left pane to initialize.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
