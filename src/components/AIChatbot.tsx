/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, RefreshCw, AlertTriangle } from "lucide-react";
import { ChatMessage } from "../types";

interface AIChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
}

const PRESET_QUERIES = [
  "Where did I spend the most money this month?",
  "Analyze my spending pattern and suggest savings",
  "How much did I spend on Swiggy and Zomato?",
  "Suggest a 10-year investment plan",
];

export default function AIChatbot({ chatHistory, onSendMessage, isGenerating }: AIChatbotProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  return (
    <div className="flex flex-col h-[550px] glass-card overflow-hidden select-none">
      {/* Chat header banner */}
      <div className="p-4 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-100">FinGuard AI Expert Chatbot</h4>
            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE SECURE SESSION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-semibold">
          Powered by Gemini 3.5 Flash
        </div>
      </div>

      {/* Message list container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/10">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4 py-8">
            <MessageSquare size={36} className="text-blue-500/30 animate-bounce" />
            <div>
              <p className="text-xs font-bold text-gray-200">Namaste! I am FinGuard AI.</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                I can review your bank statement transactions, budgets, bills, and advise you with institutional wealth strategies.
              </p>
            </div>

            {/* Quick preset queries */}
            <div className="grid grid-cols-1 gap-2 w-full pt-4">
              {PRESET_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => onSendMessage(q)}
                  className="text-left px-3.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-[10px] text-gray-300 transition-all font-medium cursor-pointer"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg) => {
          const isAI = msg.sender === "ai";
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? "" : "ml-auto flex-row-reverse"}`}>
              {/* Avatar indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isAI ? "bg-gradient-to-tr from-emerald-500/15 to-blue-500/10 border-emerald-500/25 text-emerald-400" : "bg-white/5 border-white/10 text-gray-300"
                }`}
              >
                {isAI ? <Sparkles size={14} /> : <User size={14} />}
              </div>

              {/* Message bubble */}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                  isAI
                    ? "bg-[#1c2a49]/60 border-white/5 text-gray-100"
                    : "bg-blue-600/20 border-blue-500/15 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <span className="text-[8px] text-gray-500 block mt-1.5 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-3 max-w-[85%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <RefreshCw size={14} className="animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1c2a49]/40 border border-white/5 text-xs text-gray-400 flex items-center gap-2">
              FinGuard is scanning transactions ledger...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input panel Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-slate-950/25 flex items-center gap-2.5">
        <input
          type="text"
          placeholder="Ask AI: 'Where did my salary go?' or 'Give me a budget advice'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating}
          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
        <button
          type="submit"
          disabled={isGenerating || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-gray-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/10"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
