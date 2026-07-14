/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, DollarSign, Activity, PiggyBank } from "lucide-react";
import { Transaction } from "../types";

interface KPICardsProps {
  transactions: Transaction[];
  healthScore: number;
  onNavigate: (tab: string) => void;
}

export default function KPICards({ transactions, healthScore, onNavigate }: KPICardsProps) {
  // Calculate stats from transactions
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome > totalExpenses ? totalIncome - totalExpenses : 0;
  const balance = totalIncome - totalExpenses;

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const cardsData = [
    {
      id: "income",
      title: "Total Income",
      value: formatter.format(totalIncome),
      growth: "+4.2%",
      trend: "up",
      gradient: "from-blue-600/20 via-sky-600/10 to-transparent",
      icon: ArrowUpRight,
      iconColor: "text-blue-400 bg-blue-500/15",
      borderColor: "hover:border-blue-500/30",
    },
    {
      id: "expenses",
      title: "Total Expenses",
      value: formatter.format(totalExpenses),
      growth: "-2.1%",
      trend: "down",
      gradient: "from-rose-600/20 via-pink-600/10 to-transparent",
      icon: ArrowDownRight,
      iconColor: "text-rose-400 bg-rose-500/15",
      borderColor: "hover:border-rose-500/30",
    },
    {
      id: "savings",
      title: "Total Savings",
      value: formatter.format(savings),
      growth: "+12.4%",
      trend: "up",
      gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
      icon: PiggyBank,
      iconColor: "text-emerald-400 bg-emerald-500/15",
      borderColor: "hover:border-emerald-500/30",
    },
    {
      id: "balance",
      title: "Current Balance",
      value: formatter.format(balance),
      growth: "+8.5%",
      trend: "up",
      gradient: "from-indigo-600/20 via-violet-600/10 to-transparent",
      icon: Wallet,
      iconColor: "text-indigo-400 bg-indigo-500/15",
      borderColor: "hover:border-indigo-500/30",
    },
    {
      id: "health",
      title: "Financial Health Score",
      value: `${healthScore}/100`,
      growth: "Excellent",
      trend: "up",
      gradient: "from-amber-600/20 via-yellow-600/10 to-transparent",
      icon: Activity,
      iconColor: "text-amber-400 bg-amber-500/15",
      borderColor: "hover:border-amber-500/30",
      tab: "health",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 select-none">
      {cardsData.map((card) => {
        const Icon = card.icon;
        const isUp = card.trend === "up";
        const isHealth = card.id === "health";

        return (
          <div
            key={card.id}
            onClick={() => card.tab && onNavigate(card.tab)}
            className={`p-5 glass-card glass-card-hover relative overflow-hidden flex flex-col justify-between group cursor-pointer ${card.borderColor}`}
          >
            {/* Soft inner glow gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-40`} />

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">{card.title}</span>
              <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${card.iconColor}`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="relative z-10 mt-4 flex flex-col gap-1">
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                {card.value}
              </span>

              <div className="flex items-center gap-1.5 mt-1">
                {isHealth ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {card.growth}
                  </span>
                ) : (
                  <>
                    <span className={`p-0.5 rounded-full ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    </span>
                    <span className={`text-xs font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {card.growth}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">this month</span>
                  </>
                )}
              </div>
            </div>

            {/* Glowing active decorative bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
              card.id === "income" ? "from-blue-500 to-sky-400" :
              card.id === "expenses" ? "from-rose-500 to-pink-400" :
              card.id === "savings" ? "from-emerald-500 to-teal-400" :
              card.id === "balance" ? "from-indigo-500 to-violet-400" :
              "from-amber-500 to-yellow-400"
            }`} />
          </div>
        );
      })}
    </div>
  );
}
