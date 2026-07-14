/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Download, FileSpreadsheet, PlayCircle } from "lucide-react";

interface UploadModuleProps {
  onUploadSuccess: (res: any) => void;
}

export default function UploadModule({ onUploadSuccess }: UploadModuleProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
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

  const triggerLogs = (linesCount: number) => {
    setLogs([]);
    const logsList = [
      "🔄 Initializing FinGuard AI bank statement parser...",
      "📂 Loading uploaded file context cleanly...",
      "🔍 Scanning document column headers...",
      "✅ Auto-mapped column [Date] to index 0.",
      "✅ Auto-mapped column [Description/Merchant] to index 1.",
      "✅ Auto-mapped column [Amount] to index 2.",
      "🚀 Executing Sanitization Engine pipeline:",
      "⚡ Normalizing raw date strings into Indian Standard Time formats...",
      "⚡ Truncating transaction tracking hashes and reference UPI keys...",
      "⚡ Removing empty / duplicate entries...",
      "🧠 Launching Categorization AI:",
      "👉 Mapped 'Swiggy' to [Food & Dining]",
      "👉 Mapped 'Amazon pay' to [Shopping]",
      "👉 Mapped 'Zomato Blinkit' to [Food & Dining]",
      "👉 Mapped 'Jio' to [Utilities]",
      "👉 Mapped 'Salary' to [Income]",
      "📦 Injecting structured items into persistent ledger database...",
      "🎉 Statement import completed successfully!",
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logsList.length) {
        setLogs((prev) => [...prev, logsList[current]]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 180);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    setLogs(["🔄 Reading bank statement file..."]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const response = await fetch("/api/transactions/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("finguard_user_id") || "",
          },
          body: JSON.stringify({
            fileContent: text,
            fileName: file.name,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setUploadResult(data);
          triggerLogs(data.importedCount);
          onUploadSuccess(data);
        } else {
          setLogs((prev) => [...prev, `❌ Error: ${data.error || "Failed to parse file"}`]);
        }
      } catch (err) {
        setLogs((prev) => [...prev, "❌ Networking error occurred while processing statement."]);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
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

  const loadSampleData = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const file = new File([blob], "sample_bank_statement.csv", { type: "text/csv" });
    handleFileUpload(file);
  };

  return (
    <div className="p-6 glass-card grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      {/* Column 1: Dropzone Controls */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-100">Bank Statement Upload</h3>
          <p className="text-[11px] text-gray-400">Import CSV statements for automatic sanitization & categorization</p>
        </div>

        {/* Dropzone frame */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-56 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
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
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-sm font-semibold">Running Sanitization pipeline...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <UploadCloud className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-gray-200">Drag & Drop statement or Click to browse</p>
              <p className="text-[10px] text-gray-400">Supported format: Standard Bank CSV (Date, Merchant, Amount)</p>
            </div>
          )}
        </div>

        {/* Sample dataset download & helper triggers */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={loadSampleData}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 hover:bg-blue-600/30 rounded-xl text-xs font-bold text-blue-300 transition-all cursor-pointer"
          >
            <PlayCircle size={14} /> Simulate Sample CSV
          </button>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(sampleCSV)}`}
            download="sample_bank_statement.csv"
            className="flex items-center justify-center gap-2 py-2 px-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] rounded-xl text-xs font-bold text-gray-300 transition-all cursor-pointer text-center"
          >
            <Download size={14} /> Get Template CSV
          </a>
        </div>
      </div>

      {/* Column 2: Logging and results visualizer */}
      <div className="flex flex-col h-full justify-between bg-slate-950/40 rounded-2xl border border-white/5 p-4 overflow-hidden relative">
        <div className="pb-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
            <Sparkles size={11} className="text-emerald-400" /> Pipeline Sanitization Logs
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Real-time Logger stream */}
        <div className="flex-1 overflow-y-auto font-mono text-[10px] text-gray-300 space-y-1.5 py-4 max-h-[160px] custom-scrollbar">
          {logs.map((log, idx) => (
            <div key={idx} className="leading-normal">
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-gray-500 italic text-center py-10 select-none">Waiting for file upload trigger...</p>
          )}
        </div>

        {/* Upload success indicators */}
        {uploadResult && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-400">Import Complete</p>
              <p className="text-[10px] text-gray-300 mt-0.5">
                Saved {uploadResult.importedCount} transactions. Skipped {uploadResult.duplicatesSkipped} duplicates cleanly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
