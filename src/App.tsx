/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import LeftSidebar from "./components/LeftSidebar";
import TopNavigation from "./components/TopNavigation";
import IndiaBackground from "./components/IndiaBackground";
import KPICards from "./components/KPICards";
import MainDashboard from "./components/MainDashboard";
import RightPanel from "./components/RightPanel";
import RecentTransactions from "./components/RecentTransactions";
import UploadModule from "./components/UploadModule";
import MonthlyStatementAnalyzer from "./components/MonthlyStatementAnalyzer";
import BudgetPlanner from "./components/BudgetPlanner";
import BillManager from "./components/BillManager";
import InvestmentPlanner from "./components/InvestmentPlanner";
import AIChatbot from "./components/AIChatbot";
import Reports from "./components/Reports";
import AuthPage from "./components/AuthPage";
import { User, Transaction, Budget, Bill, InvestmentProfile, ChatMessage, FinancialHealth, AIInsight } from "./types";
import { ShieldCheck, Plus, Calendar, Compass, DollarSign, Wallet, FileText, Settings, Sparkles, RefreshCw } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [investmentProfile, setInvestmentProfile] = useState<InvestmentProfile>({
    id: "",
    userId: "",
    age: 28,
    monthlySavings: 30000,
    riskProfile: "moderate",
    investmentGoal: "Wealth Creation",
    emergencyFundMonths: 6,
    durationYears: 10,
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealth>({
    score: 82,
    status: "Excellent",
    savingsRate: 40,
    expenseRatio: 60,
    debtRatio: 12,
    budgetDiscipline: 100,
    emergencyFundStatus: "Excellent (6+ Months)",
    tips: [],
  });
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Page States
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);

  // Manual Transaction Form
  const [txMerchant, setTxMerchant] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txCategory, setTxCategory] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  // Session verification on load
  useEffect(() => {
    const checkSession = async () => {
      const storedUserId = localStorage.getItem("finguard_user_id");
      if (storedUserId) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: storedUserId },
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data);
          } else {
            localStorage.removeItem("finguard_user_id");
          }
        } catch (e) {
          console.error("Session verification failed:", e);
        }
      }
      setAuthChecked(true);
    };
    checkSession();
  }, []);

  // Fetch core data on login/verification
  useEffect(() => {
    if (!currentUser) return;

    const fetchCoreData = async () => {
      const headers = { Authorization: currentUser.id };

      try {
        // Fetch Transactions
        const txRes = await fetch("/api/transactions", { headers });
        if (txRes.ok) setTransactions(await txRes.json());

        // Fetch Budgets
        const bRes = await fetch("/api/budgets", { headers });
        if (bRes.ok) setBudgets(await bRes.json());

        // Fetch Bills
        const billRes = await fetch("/api/bills", { headers });
        if (billRes.ok) setBills(await billRes.json());

        // Fetch Investment Profile
        const invRes = await fetch("/api/investment-profile", { headers });
        if (invRes.ok) setInvestmentProfile(await invRes.json());

        // Fetch Financial Health Score
        const healthRes = await fetch("/api/health-score", { headers });
        if (healthRes.ok) setHealthScore(await healthRes.json());

        // Fetch AI insights
        const insightsRes = await fetch("/api/ai/insights", { headers });
        if (insightsRes.ok) setAiInsights(await insightsRes.json());
      } catch (err) {
        console.error("Failed to fetch dashboard records:", err);
      }
    };

    fetchCoreData();
  }, [currentUser]);

  // Global actions router handler
  const handleQuickAction = (actionType: string) => {
    if (actionType === "upload") setActiveTab("upload");
    else if (actionType === "add-tx") setShowAddTxModal(true);
    else if (actionType === "budget") setActiveTab("budget");
    else if (actionType === "chatbot") setActiveTab("chatbot");
  };

  // Auth actions
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("finguard_user_id");
    setCurrentUser(null);
  };

  const handleUpgrade = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/upgrade", {
        method: "POST",
        headers: { Authorization: currentUser.id },
      });
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    } catch (e) {
      console.error("Failed to upgrade tier:", e);
    }
  };

  // Save manual transaction
  const handleAddTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !txMerchant || !txAmount) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify({
          merchant: txMerchant,
          amount: parseFloat(txAmount),
          type: txType,
          category: txCategory || undefined,
          date: txDate,
        }),
      });

      if (res.ok) {
        const newTx = await res.json();
        setTransactions((prev) => [newTx, ...prev]);
        setShowAddTxModal(false);
        setTxMerchant("");
        setTxAmount("");

        // Trigger dynamic updates
        const healthRes = await fetch("/api/health-score", { headers: { Authorization: currentUser.id } });
        if (healthRes.ok) setHealthScore(await healthRes.json());

        const bRes = await fetch("/api/budgets", { headers: { Authorization: currentUser.id } });
        if (bRes.ok) setBudgets(await bRes.json());
      }
    } catch (e) {
      console.error("Failed to save transaction:", e);
    }
  };

  // Recategorize transaction inline
  const handleRecategorize = async (id: string, category: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/transactions/recategorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify({ id, category }),
      });

      if (res.ok) {
        const updatedTx = await res.json();
        setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));

        // Sync budgets & score
        const bRes = await fetch("/api/budgets", { headers: { Authorization: currentUser.id } });
        if (bRes.ok) setBudgets(await bRes.json());

        const healthRes = await fetch("/api/health-score", { headers: { Authorization: currentUser.id } });
        if (healthRes.ok) setHealthScore(await healthRes.json());
      }
    } catch (e) {
      console.error("Recategorization failed:", e);
    }
  };

  // Register Budget Limit
  const handleSaveBudget = async (category: string, limitAmount: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify({ category, limitAmount }),
      });
      if (res.ok) {
        const updatedB = await res.json();
        setBudgets((prev) => {
          const exists = prev.some((b) => b.category === category);
          if (exists) return prev.map((b) => (b.category === category ? updatedB : b));
          return [...prev, updatedB];
        });

        const healthRes = await fetch("/api/health-score", { headers: { Authorization: currentUser.id } });
        if (healthRes.ok) setHealthScore(await healthRes.json());
      }
    } catch (e) {
      console.error("Failed to save budget:", e);
    }
  };

  // Register New Recurring Bill
  const handleAddBill = async (bill: { title: string; category: string; amount: number; dueDate: string }) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify(bill),
      });
      if (res.ok) {
        const newBill = await res.json();
        setBills((prev) => [...prev, newBill]);
      }
    } catch (e) {
      console.error("Failed to save bill:", e);
    }
  };

  // Pay Recurring Bill
  const handlePayBill = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/bills/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const { bill, transaction } = await res.json();
        setBills((prev) => prev.map((b) => (b.id === id ? bill : b)));
        setTransactions((prev) => [transaction, ...prev]);

        // Sync budgets & score
        const bRes = await fetch("/api/budgets", { headers: { Authorization: currentUser.id } });
        if (bRes.ok) setBudgets(await bRes.json());

        const healthRes = await fetch("/api/health-score", { headers: { Authorization: currentUser.id } });
        if (healthRes.ok) setHealthScore(await healthRes.json());
      }
    } catch (e) {
      console.error("Failed to pay bill:", e);
    }
  };

  // Update wealth SIP profile parameters
  const handleSaveInvestmentProfile = async (profile: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/investment-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setInvestmentProfile(await res.json());
      }
    } catch (e) {
      console.error("Failed to save investment profile:", e);
    }
  };

  // Send message to Gemini Chatbot API
  const handleSendMessage = async (msg: string) => {
    if (!currentUser || isGeneratingChat) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      userId: currentUser.id,
      sender: "user",
      message: msg,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsGeneratingChat(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: currentUser.id,
        },
        body: JSON.stringify({
          message: msg,
          history: chatHistory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: Math.random().toString(),
          userId: currentUser.id,
          sender: "ai",
          message: data.message,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, aiMessage]);
      } else {
        const errData = await res.json();
        setChatHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            userId: currentUser.id,
            sender: "ai",
            message: `❌ AI Error: ${errData.error || "Failed to reach intelligence gateway."}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          userId: currentUser.id,
          sender: "ai",
          message: "❌ AI Error: Failed to contact the FinGuard security cluster.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // Handle uploaded bank statement success triggers
  const handleUploadSuccess = (data: any) => {
    setTransactions((prev) => [...data.transactions, ...prev]);
    // Refresh budgets & health score
    const refreshData = async () => {
      const headers = { Authorization: currentUser!.id };
      const bRes = await fetch("/api/budgets", { headers });
      if (bRes.ok) setBudgets(await bRes.json());
      const healthRes = await fetch("/api/health-score", { headers });
      if (healthRes.ok) setHealthScore(await healthRes.json());
      const insightsRes = await fetch("/api/ai/insights", { headers });
      if (insightsRes.ok) setAiInsights(await insightsRes.json());
    };
    refreshData();
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen w-full bg-[#081426] flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Syncing FinGuard AI Gateways...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#081426] text-white relative">
      {/* Cinematic animated India tricolor and silhouettes background */}
      <IndiaBackground />

      {/* Main split grid layout */}
      <div className="flex pl-80 min-h-screen relative z-10">
        
        {/* Navigation Sidebar Drawer */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          onUpgrade={handleUpgrade}
        />

        {/* Dashboard core stage container */}
        <div className="flex-1 flex flex-col min-h-screen">
          
          {/* Top navigational control rail */}
          <TopNavigation currentUser={currentUser} onUpgrade={handleUpgrade} />

          {/* Interactive view container block */}
          <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
            {/* Welcome Greeting panel */}
            <section className="space-y-1 select-none">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-emerald-200 bg-clip-text text-transparent">
                Namaste, Welcome Back 👋
              </h2>
              <p className="text-xs text-gray-400">
                Take control of your money with elite, bank-grade AI-powered financial intelligence.
              </p>
            </section>

            {/* General Global KPI indicators */}
            <KPICards
              transactions={transactions}
              healthScore={healthScore.score}
              onNavigate={(tab) => setActiveTab(tab)}
            />

            {/* Tab Routed Panels */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                {/* Center analytics segment */}
                <div className="xl:col-span-3 space-y-6">
                  <MainDashboard
                    transactions={transactions}
                    budgets={budgets}
                    bills={bills}
                    onNavigate={(tab) => setActiveTab(tab)}
                  />
                  <RecentTransactions
                    transactions={transactions.slice(0, 10)}
                    onRecategorize={handleRecategorize}
                  />
                </div>

                {/* Right side contextual utilities widget panel */}
                <div className="xl:col-span-1">
                  <RightPanel
                    bills={bills}
                    insights={aiInsights}
                    savingsRate={healthScore.savingsRate}
                    emergencyStatus={healthScore.emergencyFundStatus}
                    onAction={handleQuickAction}
                    onPayBill={handlePayBill}
                  />
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <RecentTransactions transactions={transactions} onRecategorize={handleRecategorize} />
            )}

            {activeTab === "upload" && <UploadModule onUploadSuccess={handleUploadSuccess} />}

            {activeTab === "statement-analyzer" && (
              <MonthlyStatementAnalyzer onImportToGlobalLedger={handleUploadSuccess} />
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <MainDashboard
                  transactions={transactions}
                  budgets={budgets}
                  bills={bills}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
                <RecentTransactions transactions={transactions} onRecategorize={handleRecategorize} />
              </div>
            )}

            {activeTab === "budget" && (
              <BudgetPlanner budgets={budgets} onSaveBudget={handleSaveBudget} />
            )}

            {activeTab === "bills" && (
              <BillManager bills={bills} onAddBill={handleAddBill} onPayBill={handlePayBill} />
            )}

            {activeTab === "health" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                <div className="md:col-span-1 p-6 glass-card space-y-5">
                  <div className="text-center space-y-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Financial Score</span>
                    <div className="inline-flex w-32 h-32 rounded-full border-[6px] border-dashed border-emerald-500/30 items-center justify-center animate-[spin_60s_linear_infinite] relative">
                      <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-1">
                        <span className="text-3xl font-extrabold text-white font-mono">{healthScore.score}</span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{healthScore.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Budget Discipline</span>
                      <span className="font-bold text-white font-mono">{healthScore.budgetDiscipline}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Debt to Income Ratio</span>
                      <span className="font-bold text-white font-mono">{healthScore.debtRatio}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Cash Savings Rate</span>
                      <span className="font-bold text-white font-mono">{healthScore.savingsRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-6 glass-card space-y-4">
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> AI-powered Compliance suggestions
                  </h3>
                  <div className="space-y-3">
                    {healthScore.tips.map((tip, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
                        <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">₹</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                    {healthScore.tips.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No health advice generated yet. Try adding manual bills or transactions to analyze compliance levels.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "investment" && (
              <InvestmentPlanner initialProfile={investmentProfile} onSaveProfile={handleSaveInvestmentProfile} />
            )}

            {activeTab === "insights" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start select-none">
                <div className="p-6 glass-card space-y-4">
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" /> Live Advisory Recommendations
                  </h3>
                  <div className="space-y-4">
                    {aiInsights.map((ins) => (
                      <div key={ins.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                            {ins.type}
                          </span>
                          <h4 className="font-bold text-xs text-gray-200">{ins.title}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-normal">{ins.description}</p>
                        {ins.amount && (
                          <span className="text-[10px] font-bold text-white bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">
                            Potential Saving: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(ins.amount)}
                          </span>
                        )}
                      </div>
                    ))}
                    {aiInsights.length === 0 && (
                      <p className="text-xs text-gray-400 italic">AI insights compiling in background...</p>
                    )}
                  </div>
                </div>

                <div className="p-6 glass-card space-y-4">
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                    Educational Investment Suggestions
                  </h3>
                  <div className="space-y-3.5">
                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs">
                      <h4 className="font-bold text-emerald-400 mb-1">Mutual Fund SIPs (Moderate Risk)</h4>
                      <p className="text-gray-400 leading-relaxed">Consider increasing monthly Equity Mutual Fund allocations using standard systematic SIP models to capture average long-term Nifty indexes compounding yields.</p>
                    </div>
                    <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs">
                      <h4 className="font-bold text-blue-400 mb-1">Tax-Saving Instruments</h4>
                      <p className="text-gray-400 leading-relaxed">PPF and National Pension System (NPS) offer excellent tax deductor opportunities under Indian tax codes Section 80C.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chatbot" && (
              <AIChatbot chatHistory={chatHistory} onSendMessage={handleSendMessage} isGenerating={isGeneratingChat} />
            )}

            {activeTab === "reports" && (
              <Reports transactions={transactions} budgets={budgets} bills={bills} />
            )}
          </main>

          {/* Institutional Footer */}
          <footer className="py-8 text-center text-[10px] text-gray-500 border-t border-white/5 select-none print:hidden">
            <p className="font-semibold text-gray-400 uppercase tracking-widest">FinGuard AI Systems Group</p>
            <p className="mt-1">
              &copy; 2026 FinGuard AI. All rights reserved. Secure Personal Finance Intelligence &amp; Investment Advisory System.
            </p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray-300 cursor-pointer">Terms &amp; Conditions</span>
              <span className="hover:text-gray-300 cursor-pointer">Customer Support Gate</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Manual Transaction Modal Dialog */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-white select-none">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl space-y-4 animate-in scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="font-bold text-sm">Register Manual Ledger Transaction</h4>
              <button onClick={() => setShowAddTxModal(false)} className="text-gray-400 hover:text-white text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTxType("expense")}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    txType === "expense" ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-slate-900 border border-white/5 text-gray-400"
                  }`}
                >
                  Expense debit
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("income")}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    txType === "income" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" : "bg-slate-900 border border-white/5 text-gray-400"
                  }`}
                >
                  Income credit
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Merchant Description</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy Food Delivery"
                  value={txMerchant}
                  onChange={(e) => setTxMerchant(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 480"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Override Category (Optional)</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="">Auto-Detect Classification</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Housing">Housing</option>
                  <option value="Income">Income</option>
                  <option value="Investments">Investments</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Credit Card Payment">Credit Card Payment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Inject Ledger Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
