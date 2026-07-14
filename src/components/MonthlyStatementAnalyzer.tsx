/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Activity, 
  Sparkles, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  PlayCircle 
} from "lucide-react";

interface MonthlyStatementAnalyzerProps {
  onImportToGlobalLedger?: (transactions: any[]) => void;
}

export default function MonthlyStatementAnalyzer({ onImportToGlobalLedger }: MonthlyStatementAnalyzerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [openingBalance, setOpeningBalance] = useState<number>(50000); // Default ₹50,000 opening balance
  const [copied, setCopied] = useState(false);

  // Parsed Stats
  const [hasData, setHasData] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [healthScore, setHealthScore] = useState(80);
  const [healthStatus, setHealthStatus] = useState<string>("Good");
  const [healthColor, setHealthColor] = useState<string>("text-emerald-400");
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCSV = `Date,Description/Merchant,Amount,Type
10/07/2026,UPI Swiggy Food Order,480,Expense
11/07/2026,Amazon pay shop order,1899,Expense
12/07/2026,Zomato Blinkit Grocery,840,Expense
13/07/2026,Jio Fiber internet,999,Expense
14/07/2026,Salary Employer credit,125000,Income
08/07/2026,Tata Power Mumbai,2450,Expense
09/07/2026,Uber India Cab Ride,350,Expense
05/07/2026,HDFC NetBanking Rent Transfer,28000,Expense`;

  // Python Streamlit script content
  const pythonCode = `import streamlit as st
import pandas as pd
import numpy as np

# Set page styling
st.set_page_config(
    page_title="FinGuard AI - Monthly Statement Analyzer",
    page_icon="₹",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark slate theme
st.markdown("""
<style>
    .reportview-container {
        background: #081426;
    }
    h1, h2, h3 {
        color: #10B981 !important;
        font-family: 'Space Grotesk', sans-serif;
    }
    .metric-card {
        background-color: rgba(19, 31, 58, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
</style>
""", unsafe_value=True)

st.title("₹ FinGuard AI - Personal Monthly Statement Analyzer")
st.write("Clean, parse, and analyze your financial bank statements using an automated Python backend.")

# Sidebar Configuration
st.sidebar.header("⚙️ Configuration Settings")
opening_bal = st.sidebar.number_input("Opening Balance (₹)", min_value=0.0, value=50000.0, step=1000.0)

st.sidebar.markdown("""
### How to run locally:
1. Install dependencies:
   \`\`\`bash
   pip install streamlit pandas numpy
   \`\`\`
2. Save this script as \`app.py\`
3. Launch Streamlit server:
   \`\`\`bash
   streamlit run app.py
   \`\`\`
""")

# File Uploader component
uploaded_file = st.file_uploader("📂 Upload your Bank Statement CSV file", type=["csv"])

if uploaded_file is not None:
    try:
        # Read statement
        df = pd.read_csv(uploaded_file)
        
        # Clean headers
        df.columns = [c.strip().lower() for c in df.columns]
        
        # Auto map headers
        date_col = [c for c in df.columns if 'date' in c or 'time' in c]
        desc_col = [c for c in df.columns if 'desc' in c or 'merchant' in c or 'particular' in c or 'narration' in c]
        amt_col = [c for c in df.columns if 'amount' in c or 'value' in c or 'spent' in c]
        type_col = [c for c in df.columns if 'type' in c or 'cr' in c or 'dr' in c]
        
        if not date_col or not desc_col or not amt_col:
            st.error("❌ Column mapping failed. Please ensure columns named 'Date', 'Description/Merchant', and 'Amount' exist.")
        else:
            # Clean values
            df['amount_clean'] = df[amt_col[0]].astype(str).str.replace(r'[^0-9.-]', '', regex=True).astype(float)
            
            # Determine type
            if type_col:
                df['type_clean'] = df[type_col[0]].astype(str).str.lower().apply(
                    lambda x: 'income' if 'credit' in x or 'cr' in x or 'income' in x or 'in' in x else 'expense'
                )
            else:
                df['type_clean'] = df.apply(
                    lambda row: 'income' if row['amount_clean'] > 0 and any(kw in str(row[desc_col[0]]).lower() for kw in ['salary', 'dividend', 'refund', 'cashback', 'credit']) else 'expense', axis=1
                )
                df['amount_clean'] = df['amount_clean'].abs()
                
            # Aggregate calculations
            income_df = df[df['type_clean'] == 'income']
            expense_df = df[df['type_clean'] == 'expense']
            
            total_income = income_df['amount_clean'].sum()
            total_expense = expense_df['amount_clean'].sum()
            total_savings = max(0.0, total_income - total_expense)
            current_balance = opening_bal + total_income - total_expense
            
            # Compute financial health score
            savings_rate = (total_savings / total_income * 100) if total_income > 0 else 0
            health_score = int(min(100, max(10, savings_rate * 2.2)))
            
            if health_score >= 80:
                health_status = "Excellent"
                status_color = "green"
            elif health_score >= 60:
                health_status = "Good"
                status_color = "orange"
            elif health_score >= 40:
                health_status = "Average"
                status_color = "orange"
            else:
                health_status = "Poor"
                status_color = "red"
                
            # Render Core Metrics Panel
            m1, m2, m3, m4, m5 = st.columns(5)
            
            with m1:
                st.metric("Total Income", f"₹{total_income:,.2f}", delta=f"+₹{total_income:,.2f}")
            with m2:
                st.metric("Total Expenses", f"₹{total_expense:,.2f}", delta=f"-₹{total_expense:,.2f}", delta_color="inverse")
            with m3:
                st.metric("Total Savings", f"₹{total_savings:,.2f}", delta=f"{savings_rate:.1f}% Rate")
            with m4:
                st.metric("Current Balance", f"₹{current_balance:,.2f}")
            with m5:
                st.metric("Financial Health Score", f"{health_score}/100", f"Status: {health_status}")
                
            # Display charts
            st.subheader("📊 Spend Analysis and Trend")
            c1, c2 = st.columns([2, 1])
            
            with c1:
                st.markdown("**Income vs Expense Breakdown**")
                chart_data = pd.DataFrame({
                    "Category": ["Total Income", "Total Expenses", "Total Savings"],
                    "Amount (₹)": [total_income, total_expense, total_savings]
                })
                st.bar_chart(chart_data.set_index("Category"))
                
            with c2:
                st.markdown("**Advisor Feedback**")
                st.info(f"💡 Opening Balance: **₹{opening_bal:,.2f}**")
                if savings_rate < 20:
                    st.warning("⚠️ Savings rate is below the 20% healthy target. Try to scale back non-essential spending.")
                else:
                    st.success("✅ Excellent saving hygiene! You're meeting the golden 20%+ target.")
                    
            # Data preview
            st.subheader("📋 Parsed Transaction ledger")
            st.dataframe(df[[date_col[0], desc_col[0], 'amount_clean', 'type_clean']])
            
    except Exception as e:
        st.error(f"Error parsing bank statement file: {str(e)}")
else:
    st.info("💡 Please upload a CSV bank statement to start analyzing.")
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPythonScript = () => {
    const blob = new Blob([pythonCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finguard_analyzer.py";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseStatementText(text);
    };
    reader.readAsText(file);
  };

  const parseStatementText = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        alert("Empty or invalid statement file format.");
        setIsUploading(false);
        return;
      }

      // Read columns
      const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
      const dateIdx = headers.findIndex((h: string) => h.includes("date") || h.includes("time"));
      const descIdx = headers.findIndex((h: string) => h.includes("desc") || h.includes("merchant") || h.includes("particular") || h.includes("narration") || h.includes("payee"));
      const amtIdx = headers.findIndex((h: string) => h.includes("amount") || h.includes("value") || h.includes("spent") || h.includes("tx"));
      const typeIdx = headers.findIndex((h: string) => h.includes("type") || h.includes("cr/dr") || h.includes("credit") || h.includes("debit"));

      if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) {
        alert("Auto-mapping columns failed. CSV must contain: 'Date', 'Description/Merchant', and 'Amount'.");
        setIsUploading(false);
        return;
      }

      let inc = 0;
      let exp = 0;
      const txsList: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c: string) => c.replace(/^"|"$/g, "").trim());
        if (cols.length <= Math.max(dateIdx, descIdx, amtIdx)) continue;

        const rawDate = cols[dateIdx];
        const rawDesc = cols[descIdx];
        const rawAmt = parseFloat(cols[amtIdx].replace(/[^0-9.-]/g, ""));
        if (isNaN(rawAmt)) continue;

        let rawType = "expense";
        if (typeIdx !== -1) {
          const typeVal = cols[typeIdx].toLowerCase();
          if (typeVal.includes("credit") || typeVal.includes("cr") || typeVal.includes("in") || typeVal.includes("income")) {
            rawType = "income";
          }
        } else {
          const lowerDesc = rawDesc.toLowerCase();
          if (rawAmt > 0 && (lowerDesc.includes("salary") || lowerDesc.includes("dividend") || lowerDesc.includes("refund") || lowerDesc.includes("cashback") || lowerDesc.includes("credit"))) {
            rawType = "income";
          } else if (rawAmt < 0) {
            rawType = "expense";
          }
        }

        const absAmt = Math.abs(rawAmt);
        if (rawType === "income") {
          inc += absAmt;
        } else {
          exp += absAmt;
        }

        txsList.push({
          date: rawDate,
          merchant: rawDesc,
          amount: absAmt,
          type: rawType,
        });
      }

      setTotalIncome(inc);
      setTotalExpenses(exp);
      const savings = Math.max(0, inc - exp);
      setTotalSavings(savings);
      
      const bal = openingBalance + inc - exp;
      setCurrentBalance(bal);

      // Financial Health Score algorithm
      const savingsRate = inc > 0 ? (savings / inc) * 100 : 0;
      const score = Math.round(Math.min(100, Math.max(15, savingsRate * 2.2)));
      setHealthScore(score);

      let status = "Good";
      let color = "text-emerald-400";
      const recTips: string[] = [];

      if (score >= 80) {
        status = "Excellent";
        color = "text-emerald-400";
        recTips.push("🎉 Elite Saving Habits! You're storing more than 35% of your income securely.");
        recTips.push("📈 Consider allocating 60% of this month's savings to automated low-cost Index Funds/SIPs.");
      } else if (score >= 60) {
        status = "Good";
        color = "text-blue-400";
        recTips.push("✅ Standard Healthy budget! You met the core 20% savings rule cleanly.");
        recTips.push("💡 Maintain a dedicated liquid emergency fund account with 6 months worth of expenses.");
      } else if (score >= 40) {
        status = "Average";
        color = "text-amber-400";
        recTips.push("⚠️ High overhead expenses detected. Consider reviewing recurring dining & Swiggy habits.");
        recTips.push("🛒 Delay non-essential shopping items by 48 hours before pulling the trigger.");
      } else {
        status = "Poor";
        color = "text-red-400";
        recTips.push("🚨 Critical financial leak! Monthly overhead exceeded safe thresholds.");
        recTips.push("📉 Freeze luxury spends immediately and setup automated bill tracker modules.");
      }

      setHealthStatus(status);
      setHealthColor(color);
      setTips(recTips);
      setParsedTransactions(txsList);
      setHasData(true);

    } catch (err) {
      alert("Parsing statement CSV failed. Ensure it has a valid header and comma delimiters.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSampleSimulation = () => {
    setIsUploading(true);
    setTimeout(() => {
      const blob = new Blob([sampleCSV], { type: "text/csv" });
      const file = new File([blob], "sample_month_statement.csv", { type: "text/csv" });
      handleFileUpload(file);
    }, 600);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Run calculation again if user changes the opening balance input
  React.useEffect(() => {
    if (hasData) {
      const bal = openingBalance + totalIncome - totalExpenses;
      setCurrentBalance(bal);
    }
  }, [openingBalance, totalIncome, totalExpenses, hasData]);

  return (
    <div className="space-y-8 select-none">
      {/* Upper header segment */}
      <div className="p-6 glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <Activity className="text-emerald-400" size={18} /> Single-Person Monthly Statement Analyzer
          </h3>
          <p className="text-[11px] text-gray-400">
            Upload your personal month bank statement CSV to immediately render comprehensive savings rate, ledger aggregates, and elite health diagnostic recommendations.
          </p>
        </div>

        {/* Configurations Opening Balance input */}
        <div className="flex items-center gap-3 bg-slate-950/40 p-2 border border-white/5 rounded-xl shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-2">Opening Balance:</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1 text-xs text-gray-400 font-medium">₹</span>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
              className="w-32 bg-slate-900 border border-white/10 rounded-lg pl-6 pr-2 py-0.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Col: Upload Block */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-5 glass-card space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
              <UploadCloud size={14} className="text-blue-400" /> Upload Statement File
            </h4>

            {/* Dropzone frame */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-emerald-400 bg-emerald-500/10 text-white"
                  : "border-white/10 bg-slate-900/40 hover:bg-slate-800/40 text-gray-300 hover:border-blue-500/40"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-t-2 border-emerald-400 border-solid rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold">Parsing Statement Records...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <FileSpreadsheet className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-gray-200">Drag & Drop or Click to browse</p>
                  <p className="text-[9px] text-gray-400">Requires standard CSV format containing columns: Date, Merchant, Amount</p>
                </div>
              )}
            </div>

            {fileName && (
              <div className="text-center p-2 bg-slate-950/20 border border-white/5 rounded-xl text-[10px] text-emerald-400 font-mono">
                Active: {fileName}
              </div>
            )}

            <button
              onClick={triggerSampleSimulation}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 hover:bg-blue-600/30 rounded-xl text-xs font-bold text-blue-300 transition-all cursor-pointer"
            >
              <PlayCircle size={14} /> Simulate Personal CSV
            </button>
          </div>

          {/* Savings Tips / AI recommendations */}
          {hasData && (
            <div className="p-5 glass-card space-y-4">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" /> Diagnostic Recommendations
              </h4>
              <div className="space-y-3">
                {tips.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-300 leading-relaxed">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Calculations & Results */}
        <div className="xl:col-span-2 space-y-6">
          {hasData ? (
            <div className="space-y-6">
              {/* Main metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Income */}
                <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Income</span>
                  <div className="my-2.5">
                    <span className="text-lg font-bold text-emerald-400 font-mono">₹{totalIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md w-fit font-medium">
                    <TrendingUp size={10} /> +Credits Received
                  </div>
                </div>

                {/* 2. Total Expenses */}
                <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Expenses</span>
                  <div className="my-2.5">
                    <span className="text-lg font-bold text-red-400 font-mono">₹{totalExpenses.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md w-fit font-medium">
                    <TrendingDown size={10} /> -Debits Recorded
                  </div>
                </div>

                {/* 3. Total Savings */}
                <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Savings</span>
                  <div className="my-2.5">
                    <span className="text-lg font-bold text-blue-400 font-mono">₹{totalSavings.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md w-fit font-medium">
                    <PiggyBank size={10} /> Net Retained
                  </div>
                </div>

                {/* 4. Current Balance */}
                <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Balance</span>
                  <div className="my-2.5">
                    <span className="text-lg font-bold text-purple-400 font-mono">₹{currentBalance.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded-md w-fit font-medium">
                    <Wallet size={10} /> Statement End
                  </div>
                </div>

                {/* 5. Health Score */}
                <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Health Score</span>
                  <div className="my-2.5">
                    <span className={`text-xl font-black ${healthColor} font-mono`}>{healthScore}/100</span>
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider`}>
                    Status: <span className={healthColor}>{healthStatus}</span>
                  </div>
                </div>
              </div>

              {/* Transactions Preview Table */}
              <div className="p-5 glass-card space-y-4">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
                  Statement Transactions List ({parsedTransactions.length})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-white/5 custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-white/5 text-gray-400 font-semibold">
                        <th className="p-3">Date</th>
                        <th className="p-3">Description/Merchant</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedTransactions.map((tx, index) => (
                        <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-mono text-gray-400 text-[10px]">{tx.date}</td>
                          <td className="p-3 font-semibold text-gray-200">{tx.merchant}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-mono font-bold ${
                            tx.type === "income" ? "text-emerald-400" : "text-gray-200"
                          }`}>
                            ₹{tx.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[250px] border border-white/5 bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-gray-400 italic">
              <p className="text-sm">Please upload or simulate a bank statement to render the metrics dashboard.</p>
            </div>
          )}

          {/* Python Frontend Code Generator Panel */}
          <div className="p-5 glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                <FileCode size={14} className="text-emerald-400 animate-pulse" /> Copy Python Streamlit Frontend Code
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-300 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Code
                    </>
                  )}
                </button>
                <button
                  onClick={downloadPythonScript}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 transition-all cursor-pointer"
                >
                  <Download size={12} /> Download Script
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-400">
              The copyable block below provides a complete, Production-Ready Python web frontend powered by **Streamlit**. It replicates this precise dashboard layout, mapping headers dynamically, showing KPIs, rendering trend graphs, and evaluating the overall Financial Health Score instantly in local setups!
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-950/80 rounded-xl border border-white/5 text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-[300px] custom-scrollbar leading-normal">
                {pythonCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
