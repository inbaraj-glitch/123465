/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Transaction, Budget, Bill } from "../types";

interface MainDashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  onNavigate: (tab: string) => void;
}

export default function MainDashboard({
  transactions,
  budgets,
  bills,
  onNavigate,
}: MainDashboardProps) {
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);

  // Group transactions for line chart (last 6 months simulation)
  const monthlyData = [
    { month: "Feb", income: 110000, expense: 78000 },
    { month: "Mar", income: 110000, expense: 82000 },
    { month: "Apr", income: 125000, expense: 89000 },
    { month: "May", income: 125000, expense: 74000 },
    { month: "Jun", income: 125000, expense: 81000 },
    { month: "Jul", income: 125000, expense: 72420 }, // Current simulated month
  ];

  // Group transactions by category for doughnut
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const totalExpense = Object.values(categoryMap).reduce((sum, v) => sum + v, 0);

  const colors: Record<string, string> = {
    "Food & Dining": "#10b981", // emerald-500
    "Shopping": "#3b82f6",      // blue-500
    "Transport": "#a855f7",     // purple-500
    "Entertainment": "#f59e0b", // amber-500
    "Utilities": "#ec4899",     // pink-500
    "Investments": "#14b8a6",   // teal-500
    "Housing": "#6366f1",       // indigo-500
    "Healthcare": "#ef4444",    // red-500
    "Others": "#6b7280",        // gray-500
  };

  const donutData = Object.entries(categoryMap).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    color: colors[category] || "#6b7280",
  })).sort((a, b) => b.value - a.value);

  // Formatting currency
  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Coordinates for smooth line chart SVG
  const width = 600;
  const height = 240;
  const padding = 40;

  const maxVal = 140000;
  const minVal = 0;

  const getX = (idx: number) => padding + (idx * (width - 2 * padding)) / (monthlyData.length - 1);
  const getY = (val: number) => height - padding - ((val - minVal) * (height - 2 * padding)) / (maxVal - minVal);

  const incomePoints = monthlyData.map((d, i) => `${getX(i)},${getY(d.income)}`).join(" ");
  const expensePoints = monthlyData.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(" ");

  // Doughnut calculations
  let accumulatedAngle = 0;
  const radius = 60;
  const strokeWidth = 14;
  const center = 80;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      {/* Chart 1: Income vs Expense Trend (Line Chart) */}
      <div className="p-6 glass-card lg:col-span-2 flex flex-col justify-between group">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">
              Income vs Expense Trend
            </h3>
            <p className="text-[11px] text-gray-400">Monthly cashflow analysis for last 6 months</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-blue-400">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Income
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Expenses
            </span>
          </div>
        </div>

        {/* SVG Cubic Curve Chart */}
        <div className="relative w-full overflow-x-auto custom-scrollbar">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
            {/* Grid Lines */}
            {Array.from({ length: 4 }).map((_, i) => {
              const yVal = minVal + (i * (maxVal - minVal)) / 3;
              const y = getY(yVal);
              return (
                <g key={i}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                  <text x={padding - 5} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">
                    {Math.round(yVal / 1000)}k
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {monthlyData.map((d, i) => (
              <text key={i} x={getX(i)} y={height - 10} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">
                {d.month}
              </text>
            ))}

            {/* Income Line & Glow Gradient */}
            <polyline fill="none" stroke="#2563EB" strokeWidth="3" points={incomePoints} />
            {/* Expense Line & Glow Gradient */}
            <polyline fill="none" stroke="#10B981" strokeWidth="3" points={expensePoints} />

            {/* Glowing nodes on hover */}
            {monthlyData.map((d, i) => (
              <g key={i} className="cursor-pointer">
                <circle
                  cx={getX(i)}
                  cy={getY(d.income)}
                  r={hoveredLineIndex === i ? 6 : 4}
                  fill="#2563EB"
                  stroke="#081426"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredLineIndex(i)}
                  onMouseLeave={() => setHoveredLineIndex(null)}
                />
                <circle
                  cx={getX(i)}
                  cy={getY(d.expense)}
                  r={hoveredLineIndex === i ? 6 : 4}
                  fill="#10B981"
                  stroke="#081426"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredLineIndex(i)}
                  onMouseLeave={() => setHoveredLineIndex(null)}
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip layer */}
          {hoveredLineIndex !== null && (
            <div
              className="absolute bg-slate-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur text-xs z-30"
              style={{
                left: `${(getX(hoveredLineIndex) / width) * 100}%`,
                top: "10px",
                transform: "translateX(-50%)",
              }}
            >
              <h4 className="font-bold text-white mb-1.5">{monthlyData[hoveredLineIndex].month} Statement</h4>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-blue-400">
                  <span>Income:</span>
                  <span className="font-bold">{formatRupee(monthlyData[hoveredLineIndex].income)}</span>
                </p>
                <p className="flex items-center gap-2 text-emerald-400">
                  <span>Expenses:</span>
                  <span className="font-bold">{formatRupee(monthlyData[hoveredLineIndex].expense)}</span>
                </p>
                <p className="border-t border-white/10 pt-1 mt-1 text-gray-300 flex items-center gap-2">
                  <span>Savings:</span>
                  <span className="font-bold">
                    {formatRupee(monthlyData[hoveredLineIndex].income - monthlyData[hoveredLineIndex].expense)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Expense Category Breakdowns (Doughnut Chart) */}
      <div className="p-6 glass-card flex flex-col justify-between group">
        <div className="pb-4 border-b border-white/5 mb-3">
          <h3 className="text-base font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">
            Expense Categories
          </h3>
          <p className="text-[11px] text-gray-400">Total expense allocation this month</p>
        </div>

        <div className="flex items-center justify-center py-2 relative">
          {/* Doughnut SVG */}
          <svg width="160" height="160" className="relative z-10">
            {donutData.length === 0 ? (
              <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
            ) : (
              donutData.map((d, idx) => {
                const angle = (d.percentage / 100) * 360;
                const strokeDash = `${(d.percentage / 100) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`;
                const rotation = accumulatedAngle - 90;
                accumulatedAngle += angle;

                return (
                  <circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={hoveredDonutIndex === idx ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={strokeDash}
                    transform={`rotate(${rotation} 80 80)`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredDonutIndex(idx)}
                    onMouseLeave={() => setHoveredDonutIndex(null)}
                  />
                );
              })
            )}
            <circle cx="80" cy="80" r="45" fill="#081426" />
          </svg>

          {/* Centered Percentage Stat inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            {hoveredDonutIndex !== null ? (
              <>
                <span className="text-xs text-gray-400 font-semibold truncate max-w-[80px]">
                  {donutData[hoveredDonutIndex].name}
                </span>
                <span className="text-lg font-bold text-white">
                  {donutData[hoveredDonutIndex].percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Spent</span>
                <span className="text-sm font-bold text-white">
                  {formatRupee(totalExpense)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Categories Legend list with values */}
        <div className="mt-4 space-y-1.5 overflow-y-auto max-h-[140px] custom-scrollbar px-1">
          {donutData.slice(0, 4).map((d, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between text-xs p-1.5 rounded-lg border transition-all ${
                hoveredDonutIndex === idx ? "bg-white/[0.04] border-white/10" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="font-medium text-gray-300">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{formatRupee(d.value)}</span>
                <span className="text-[10px] text-gray-400 font-semibold bg-white/5 px-1.5 py-0.5 rounded">
                  {d.percentage}%
                </span>
              </div>
            </div>
          ))}
          {donutData.length > 4 && (
            <button
              onClick={() => onNavigate("transactions")}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold text-center w-full mt-2 block"
            >
              + {donutData.length - 4} More Categories in Transactions
            </button>
          )}
        </div>
      </div>

      {/* Row 2, Col 1-3: Budget Progress & Upcoming Bills Quick Cards */}
      <div className="p-6 glass-card lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 group">
        
        {/* Left Sub-card: Budget disciplines summary */}
        <div className="space-y-4 md:border-r border-white/5 md:pr-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Active Budgets Progress
            </h4>
            <span
              onClick={() => onNavigate("budget")}
              className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer font-bold tracking-wider uppercase"
            >
              Optimize
            </span>
          </div>

          <div className="space-y-3.5">
            {budgets.slice(0, 3).map((b) => {
              const pct = b.limitAmount > 0 ? Math.round((b.spentAmount / b.limitAmount) * 100) : 0;
              const isOver = b.spentAmount > b.limitAmount;
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">{b.category}</span>
                    <span className={isOver ? "text-red-400 font-bold" : "text-gray-400"}>
                      {formatRupee(b.spentAmount)} / {formatRupee(b.limitAmount)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isOver
                          ? "bg-gradient-to-r from-red-500 to-pink-600"
                          : pct > 80
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-gradient-to-r from-blue-500 to-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No budgets set. Click Optimize to create budgets!</p>
            )}
          </div>
        </div>

        {/* Center Sub-card: Investment allocation suggestions */}
        <div className="space-y-4 md:border-r border-white/5 md:pr-6 md:pl-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Recommended Portfolio Allocation
            </h4>
            <span
              onClick={() => onNavigate("investment")}
              className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer font-bold tracking-wider uppercase"
            >
              Rebalance
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-400">Equity Mutual Funds</span>
              <span className="font-bold text-emerald-400">45% (Moderate SIP)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-400">Government Securities & Bonds</span>
              <span className="font-bold text-blue-400">25% (Tax Saving)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-400">Digital Gold / ETF</span>
              <span className="font-bold text-amber-400">15% (Inflation Hedge)</span>
            </div>
          </div>
        </div>

        {/* Right Sub-card: Overdue Alerts & Unpaid Bills */}
        <div className="space-y-4 md:pl-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" /> Critical Bill Payments
            </h4>
            <span
              onClick={() => onNavigate("bills")}
              className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer font-bold tracking-wider uppercase"
            >
              Pay All
            </span>
          </div>

          <div className="space-y-3 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
            {bills.filter((b) => b.status === "unpaid").slice(0, 2).map((b) => (
              <div key={b.id} className="flex items-center justify-between p-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 rounded-xl transition-all">
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-gray-200 truncate">{b.title}</h5>
                  <p className="text-[9px] text-red-400 font-bold">Due {b.dueDate}</p>
                </div>
                <span className="text-xs font-bold text-gray-100 shrink-0 bg-[#081426] px-2.5 py-1 rounded-lg border border-white/10">
                  {formatRupee(b.amount)}
                </span>
              </div>
            ))}
            {bills.filter((b) => b.status === "unpaid").length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1.5" />
                <p className="text-xs">All bills are paid!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
