/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Sparkles,
  ShieldAlert,
  Compass,
  FileText,
  MessageSquare,
  Activity,
  PlusCircle,
  HelpCircle,
  Check,
} from "lucide-react";
import { Bill, AIInsight } from "../types";

interface RightPanelProps {
  bills: Bill[];
  insights: AIInsight[];
  savingsRate: number;
  emergencyStatus: string;
  onAction: (actionType: string) => void;
  onPayBill: (id: string) => void;
}

export default function RightPanel({
  bills,
  insights,
  savingsRate,
  emergencyStatus,
  onAction,
  onPayBill,
}: RightPanelProps) {
  const unpaidBills = bills.filter((b) => b.status === "unpaid");

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <aside className="space-y-6 select-none">
      {/* 1. Quick Actions Panel */}
      <div className="p-5 glass-card space-y-4">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-blue-400" /> Quick Smart Actions
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onAction("upload")}
            className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center text-xs text-emerald-400 transition-all font-semibold gap-1.5 cursor-pointer group"
          >
            <PlusCircle size={18} className="group-hover:scale-110 transition-transform" />
            Upload Statement
          </button>
          <button
            onClick={() => onAction("add-tx")}
            className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center text-xs text-blue-400 transition-all font-semibold gap-1.5 cursor-pointer group"
          >
            <PlusCircle size={18} className="group-hover:scale-110 transition-transform" />
            Add Transaction
          </button>
          <button
            onClick={() => onAction("budget")}
            className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center text-xs text-amber-400 transition-all font-semibold gap-1.5 cursor-pointer group"
          >
            <Compass size={18} className="group-hover:scale-110 transition-transform" />
            Add Budget
          </button>
          <button
            onClick={() => onAction("chatbot")}
            className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center text-xs text-purple-400 transition-all font-semibold gap-1.5 cursor-pointer group"
          >
            <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
            AI Expert Chat
          </button>
        </div>
      </div>

      {/* 2. Emergency Fund & Savings Meter */}
      <div className="p-5 glass-card space-y-3.5">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
          Emergency Fund & Health
        </h4>
        <div className="space-y-3">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Reserve Status</span>
              <span className="text-xs font-bold text-emerald-400">{emergencyStatus}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
              Secure
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Savings Rate Indicator</span>
              <span className="font-bold text-white">{savingsRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, savingsRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Bills Panel */}
      <div className="p-5 glass-card space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            Upcoming Bills
          </h4>
          <span className="text-[10px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full">
            {unpaidBills.length} unpaid
          </span>
        </div>

        <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {unpaidBills.map((bill) => (
            <div
              key={bill.id}
              className="p-3 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 rounded-xl flex items-center justify-between transition-all group"
            >
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-gray-200 truncate">{bill.title}</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Due: {bill.dueDate}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-gray-200">{formatRupee(bill.amount)}</span>
                <button
                  onClick={() => onPayBill(bill.id)}
                  className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                  title="Mark as paid"
                >
                  <Check size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
          {unpaidBills.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">All bills paid. No upcoming payments!</p>
          )}
        </div>
      </div>

      {/* 4. AI Guard Insights & Financial Tips */}
      <div className="p-5 glass-card space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> AI Insights Guard
          </h4>
        </div>

        <div className="space-y-3">
          {insights.slice(0, 3).map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-xl border transition-all ${
                insight.type === "alert"
                  ? "bg-red-500/5 border-red-500/10"
                  : insight.type === "saving"
                  ? "bg-emerald-500/5 border-emerald-500/10"
                  : "bg-blue-500/5 border-blue-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {insight.type === "alert" ? (
                  <ShieldAlert size={14} className="text-red-400" />
                ) : (
                  <Sparkles size={14} className={insight.type === "saving" ? "text-emerald-400" : "text-blue-400"} />
                )}
                <h5 className="text-xs font-bold text-gray-100">{insight.title}</h5>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">{insight.description}</p>
              {insight.amount && (
                <span className="text-[9px] font-bold text-white bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5 mt-1.5 inline-block">
                  Potential saving: {formatRupee(insight.amount)}
                </span>
              )}
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">Initializing real-time AI guard insights...</p>
          )}
        </div>
      </div>
    </aside>
  );
}
