/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Bell, Calendar, Moon, Sun, ShieldAlert, BadgeCheck, Clock } from "lucide-react";
import { User } from "../types";

interface TopNavigationProps {
  currentUser: User | null;
  onUpgrade: () => void;
}

export default function TopNavigation({ currentUser, onUpgrade }: TopNavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const alerts = [
    {
      id: 1,
      type: "alert",
      title: "Tata Power Due in 6 Days",
      text: "Avoid ₹100 late payment charges by enabling instant auto-payment.",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "success",
      title: "Bank Statement Sanitized",
      text: "HDFC card statement imported cleanly. 25 raw items categorized.",
      time: "1 day ago",
    },
    {
      id: 3,
      type: "warning",
      title: "Food Budget Near Limit",
      text: "Spent ₹14,240 out of ₹15,000 category limit. Take control of Swiggy order sizes.",
      time: "2 days ago",
    },
  ];

  return (
    <header className="h-20 bg-[#101b30]/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-20 text-white select-none">
      {/* Search Input Box */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search transactions, bills, or ask chatbot..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Right Tools Controls */}
      <div className="flex items-center gap-6">
        {/* Date Time Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/45 border border-white/5 rounded-xl text-xs text-gray-300">
          <Calendar size={14} className="text-emerald-400" />
          <span className="font-medium">{formattedDate}</span>
        </div>

        {/* Live Security Shield Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          MILITARY GUARD ACTIVE
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-slate-900/50 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800/60 transition-all relative"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-card shadow-2xl p-4 z-50 text-slate-100 animate-in fade-in slide-in-from-top-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <span className="font-bold text-sm">Security & Financial Alerts</span>
                <span className="text-[10px] bg-red-500/15 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                  3 Active
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map((al) => (
                  <div key={al.id} className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 transition-all">
                    <div className="flex gap-2">
                      {al.type === "alert" || al.type === "warning" ? (
                        <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
                      ) : (
                        <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-200">{al.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{al.text}</p>
                        <span className="text-[9px] text-gray-500 mt-1 block flex items-center gap-1">
                          <Clock size={8} /> {al.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Visual Toggle (aesthetic) */}
        <button className="p-2 bg-slate-900/50 border border-white/10 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 transition-all">
          <Moon size={18} />
        </button>

        {/* Profile Avatar Header */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <img
              src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg"}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full bg-slate-800 border border-emerald-500/30"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gray-100">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {currentUser.premiumBadge ? "PRO MEMBER" : "FREE TIER"}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
