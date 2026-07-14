/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LayoutDashboard,
  Receipt,
  UploadCloud,
  BarChart3,
  Compass,
  CalendarDays,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { User } from "../types";

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onUpgrade: () => void;
}

export default function LeftSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onUpgrade,
}: LeftSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "upload", label: "Upload Data", icon: UploadCloud },
    { id: "statement-analyzer", label: "Statement Analyzer", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "budget", label: "Budget Planner", icon: Compass },
    { id: "bills", label: "Bill Manager", icon: CalendarDays },
    { id: "health", label: "Financial Health", icon: ShieldAlert },
    { id: "investment", label: "Investment Planner", icon: GraduationCap },
    { id: "insights", label: "AI Insights", icon: Sparkles },
    { id: "chatbot", label: "AI Chatbot", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <aside className="w-80 bg-[#141e37]/75 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-10 text-white select-none">
      {/* FinGuard AI Logo Banner */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent flex items-center gap-1.5">
            FinGuard AI <span className="text-emerald-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10">₹</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
            Secure Financial Future
          </p>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/30 to-emerald-600/10 text-white border-l-4 border-emerald-500 shadow-md shadow-blue-500/5"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile & Made in India Cards */}
      <div className="p-4 border-t border-white/5 space-y-4 bg-slate-950/20">
        {/* User Profile Card */}
        {currentUser && (
          <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg"}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-emerald-500/30 bg-slate-800"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm truncate">{currentUser.name}</span>
                  {currentUser.premiumBadge && (
                    <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1 rounded border border-amber-500/30 uppercase tracking-wider">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">Since {currentUser.memberSince}</p>
              </div>
            </div>

            {!currentUser.premiumBadge && (
              <button
                onClick={onUpgrade}
                className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-[11px] font-bold tracking-wider uppercase text-slate-950 transition-all shadow-md shadow-amber-500/10"
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        )}

        {/* Made in India Card */}
        <div className="p-3 bg-gradient-to-b from-[#1E293B]/60 to-[#0F172A]/80 rounded-xl border border-white/5 flex items-center gap-3">
          {/* Conceptual Indian Flag visual */}
          <div className="flex flex-col w-6 h-5 rounded overflow-hidden shadow border border-white/10 shrink-0">
            <div className="h-1/3 bg-[#FF9933]"></div>
            <div className="h-1/3 bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full border border-blue-800 animate-spin [animation-duration:10s]"></div>
            </div>
            <div className="h-1/3 bg-[#128807]"></div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-300 tracking-wider uppercase">
              Made in India
            </h4>
            <p className="text-[9px] text-gray-400">
              Secure Financial Intelligence &middot; Powered by AI
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
        >
          <LogOut size={14} />
          Sign Out Security Session
        </button>
      </div>
    </aside>
  );
}
