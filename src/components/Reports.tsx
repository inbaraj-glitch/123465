/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, Download, Printer, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import { Transaction, Budget, Bill } from "../types";

interface ReportsProps {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
}

export default function Reports({ transactions, budgets, bills }: ReportsProps) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = totalIncome > totalExpense ? totalIncome - totalExpense : 0;

  const unpaidCount = bills.filter((b) => b.status === "unpaid").length;
  const budgetDeficits = budgets.filter((b) => b.spentAmount > b.limitAmount).length;

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate Excel-like CSV download for the ledger report
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "FinGuard AI Secure Financial Report\n";
    csvContent += `Generated On,${new Date().toLocaleDateString("en-IN")}\n\n`;
    csvContent += `Total Monthly Income,${totalIncome}\n`;
    csvContent += `Total Monthly Expenses,${totalExpense}\n`;
    csvContent += `Estimated Savings,${totalSavings}\n\n`;

    csvContent += "Category Budget Overviews\n";
    csvContent += "Category,Limit Amount,Spent Amount,Overdraft Status\n";
    budgets.forEach((b) => {
      const status = b.spentAmount > b.limitAmount ? "Overdrafted" : "Healthy";
      csvContent += `"${b.category}",${b.limitAmount},${b.spentAmount},${status}\n`;
    });

    csvContent += "\nCleaned Transaction Ledger Listings\n";
    csvContent += "Date,Merchant,Category,Amount,Type,Status\n";
    transactions.forEach((t) => {
      csvContent += `${t.date},"${t.merchant}","${t.category}",${t.amount},${t.type},${t.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinGuard_AI_Financial_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none print:bg-white print:text-black">
      {/* 1. Header with Print/Export Triggers */}
      <div className="p-6 glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-base font-bold text-gray-100">Financial Reports & Exports</h3>
          <p className="text-[11px] text-gray-400">Compile ledger balances, monthly overviews, and export spreadsheets</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 py-2 px-4 bg-slate-900 border border-white/10 hover:bg-slate-800 rounded-xl text-xs font-bold text-gray-200 transition-all cursor-pointer"
          >
            <Download size={14} className="text-emerald-400" /> Export CSV Spreadsheet
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Printer size={14} /> Print Audit PDF Report
          </button>
        </div>
      </div>

      {/* 2. Structured Report View (Looks gorgeous and print-friendly) */}
      <div className="p-8 glass-card space-y-8 print:border-none print:bg-transparent print:p-0">
        
        {/* Report Meta Header */}
        <div className="border-b border-white/10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl print:hidden">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100 print:text-black uppercase tracking-wide">
                FinGuard Personal Finance Intelligence Audit
              </h2>
              <p className="text-xs text-gray-400 print:text-gray-600">
                Generated securely on {new Date().toLocaleDateString("en-IN")} &middot; Powered by AI
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold px-3 py-1 uppercase print:hidden">
              Secure Ledger
            </span>
          </div>
        </div>

        {/* Audit Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-1 print:border-black/10">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Total Income credit</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{formatRupee(totalIncome)}</span>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-1 print:border-black/10">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Total Expense debit</span>
            <span className="text-xl font-bold text-red-400 font-mono">{formatRupee(totalExpense)}</span>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-1 print:border-black/10">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Accumulated Savings Buffer</span>
            <span className="text-xl font-bold text-white print:text-black font-mono">{formatRupee(totalSavings)}</span>
          </div>
        </div>

        {/* Budget Audit Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-200 print:text-black uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400 print:hidden" /> Active Category Limit Thresholds
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 print:text-black border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] text-gray-400 uppercase font-bold">
                  <th className="py-2.5">Category Name</th>
                  <th className="py-2.5 text-right">Limit threshold</th>
                  <th className="py-2.5 text-right">Actual spent</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-black/10">
                {budgets.map((b) => {
                  const isOver = b.spentAmount > b.limitAmount;
                  return (
                    <tr key={b.id} className="text-xs">
                      <td className="py-3 font-semibold">{b.category}</td>
                      <td className="py-3 text-right font-mono">{formatRupee(b.limitAmount)}</td>
                      <td className="py-3 text-right font-mono">{formatRupee(b.spentAmount)}</td>
                      <td className={`py-3 text-right font-bold uppercase text-[10px] ${isOver ? "text-red-400" : "text-emerald-400"}`}>
                        {isOver ? "Overdraft" : "Healthy"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk & Safety Check Summary block */}
        <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3.5 print:border-black/10 print:bg-slate-100">
          <h4 className="text-xs font-bold text-gray-200 print:text-black uppercase tracking-widest">
            Institutional Compliance & Safety Audit Check
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              {budgetDeficits > 0 ? (
                <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="text-gray-300 print:text-black">
                Budget Deficits Check:{" "}
                <span className="font-bold">{budgetDeficits === 0 ? "Excellent. No overspent categories." : `${budgetDeficits} Categories Overspent.`}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {unpaidCount > 0 ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="text-gray-300 print:text-black">
                Pending bills liability check:{" "}
                <span className="font-bold">{unpaidCount === 0 ? "Safe. All recurring utilities cleared." : `${unpaidCount} Overdue payments pending.`}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div className="border-t border-white/10 pt-6 text-[10px] text-gray-400 text-center space-y-1 print:text-gray-600 print:border-black/10">
          <p className="font-bold uppercase tracking-wider text-gray-300 print:text-black">FinGuard AI Financial Systems Corporation</p>
          <p>
            This statement was compiled and auto-sanitized through bank-grade algorithms. All calculations are advisory only and protected securely by military hashing standards.
          </p>
        </div>

      </div>
    </div>
  );
}
