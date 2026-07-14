/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CalendarDays, Plus, CheckCircle2, AlertTriangle, Clock, CreditCard, Receipt, FileText } from "lucide-react";
import { Bill } from "../types";

interface BillManagerProps {
  bills: Bill[];
  onAddBill: (bill: { title: string; category: string; amount: number; dueDate: string }) => void;
  onPayBill: (id: string) => void;
}

const CATEGORIES = ["Utilities", "Housing", "Credit Card Payment", "Entertainment", "Healthcare", "Others"];

export default function BillManager({ bills, onAddBill, onPayBill }: BillManagerProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) return;

    onAddBill({
      title,
      category,
      amount: parseFloat(amount),
      dueDate,
    });

    setTitle("");
    setAmount("");
    setDueDate("");
    setShowAddForm(false);
  };

  const paidBills = bills.filter((b) => b.status === "paid");
  const unpaidBills = bills.filter((b) => b.status === "unpaid");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
      {/* Col 1: Summary Stats and Quick Creation Form */}
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="p-5 glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard size={14} className="text-blue-400" /> Bill Ledger Summary
            </h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 text-[10px] font-bold tracking-wider uppercase cursor-pointer"
            >
              {showAddForm ? "Hide" : "Add Bill"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Pending Total</span>
              <span className="text-base font-bold text-red-400 font-mono">
                {formatRupee(unpaidBills.reduce((sum, b) => sum + b.amount, 0))}
              </span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Paid Total</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {formatRupee(paidBills.reduce((sum, b) => sum + b.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Creation Form */}
        {showAddForm && (
          <div className="p-5 glass-card space-y-4 animate-in fade-in slide-in-from-top-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
              <Receipt size={14} className="text-emerald-400" /> Register Recurring Bill
            </h4>
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Airtel Fibernet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bill Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 999"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-xs font-bold tracking-wider uppercase text-white rounded-xl transition-all shadow-md cursor-pointer"
              >
                Register Bill Tracker
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Col 2-3: Bills Lists panels */}
      <div className="p-6 glass-card md:col-span-2 space-y-6">
        {/* Pending Bills Grid Section */}
        <div className="space-y-3.5">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Clock size={16} /> Pending & Due Payments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {unpaidBills.map((b) => (
              <div key={b.id} className="p-4 bg-red-500/[0.02] border border-red-500/15 rounded-2xl flex flex-col justify-between hover:bg-red-500/[0.05] transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-sm text-gray-100 truncate">{b.title}</h5>
                    <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                      Unpaid
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Due Date: <span className="font-bold text-red-400 font-mono">{b.dueDate}</span></p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                  <span className="font-bold text-base text-gray-100 font-mono">{formatRupee(b.amount)}</span>
                  <button
                    onClick={() => onPayBill(b.id)}
                    className="py-1 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-[10px] font-bold tracking-wider uppercase text-white rounded-lg transition-all cursor-pointer"
                  >
                    Quick Pay Account
                  </button>
                </div>
              </div>
            ))}
            {unpaidBills.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10 border border-dashed border-white/5 rounded-2xl col-span-2">
                🎉 No pending payments. Amazing job staying on top of bills!
              </p>
            )}
          </div>
        </div>

        {/* Paid Bills Table Section */}
        <div className="space-y-3.5 border-t border-white/5 pt-6">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 size={16} /> Paid Payments Record History
          </h3>

          <div className="overflow-x-auto max-h-[200px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  <th className="py-2 px-3">Date Paid</th>
                  <th className="py-2 px-3">Bill Description</th>
                  <th className="py-2 px-3">Classification</th>
                  <th className="py-2 px-3 text-right">Amount paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paidBills.map((b) => (
                  <tr key={b.id} className="text-xs text-gray-300">
                    <td className="py-2.5 px-3 font-mono">{new Date().toISOString().split("T")[0]}</td>
                    <td className="py-2.5 px-3 font-semibold">{b.title}</td>
                    <td className="py-2.5 px-3">{b.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 font-mono">
                      {formatRupee(b.amount)}
                    </td>
                  </tr>
                ))}
                {paidBills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 italic text-xs">
                      No paid record listings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
