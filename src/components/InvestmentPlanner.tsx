/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GraduationCap, ShieldAlert, Sparkles, TrendingUp, Info, Percent, HelpCircle } from "lucide-react";

interface InvestmentPlannerProps {
  initialProfile: {
    age: number;
    monthlySavings: number;
    riskProfile: string;
    investmentGoal: string;
    emergencyFundMonths: number;
    durationYears: number;
  };
  onSaveProfile: (profile: any) => void;
}

export default function InvestmentPlanner({ initialProfile, onSaveProfile }: InvestmentPlannerProps) {
  const [age, setAge] = useState(initialProfile.age || 28);
  const [monthlySavings, setMonthlySavings] = useState(initialProfile.monthlySavings || 30000);
  const [riskProfile, setRiskProfile] = useState(initialProfile.riskProfile || "moderate");
  const [investmentGoal, setInvestmentGoal] = useState(initialProfile.investmentGoal || "Wealth Creation");
  const [emergencyFundMonths, setEmergencyFundMonths] = useState(initialProfile.emergencyFundMonths || 6);
  const [durationYears, setDurationYears] = useState(initialProfile.durationYears || 10);

  const [projectedValue, setProjectedValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);

  // Projected Compound Calculation
  useEffect(() => {
    // Interest rates per annum depending on risk profile
    const rateMap: Record<string, number> = {
      conservative: 0.07, // 7% Gold/Debt/FD mix
      moderate: 0.11,     // 11% Hybrid Mutual Funds
      aggressive: 0.14,   // 14% Mid/Small Cap Equity Mutual Funds
    };

    const r = (rateMap[riskProfile] || 0.11) / 12; // Monthly rate
    const n = durationYears * 12;                  // Total months
    const P = monthlySavings;

    // Compound SIP Formula: M = P * [ ( (1 + r)^n - 1 ) / r ] * (1 + r)
    const M = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInv = P * n;

    setProjectedValue(Math.round(M));
    setTotalInvested(Math.round(totalInv));
    setInterestEarned(Math.round(M - totalInv));
  }, [monthlySavings, riskProfile, durationYears]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      age,
      monthlySavings,
      riskProfile,
      investmentGoal,
      emergencyFundMonths,
      durationYears,
    });
  };

  const formatRupee = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const adviceList: Record<string, string[]> = {
    conservative: [
      "Government PPF (Public Provident Fund): High tax benefits under Section 80C, secure 7.1% p.a. guaranteed returns.",
      "Arbitrage or Debt Mutual Funds: Extremely low volatility compared to direct stock investments.",
      "Digital Gold (ETF/Sovereign Gold Bonds): Inflation-hedged, tax-exempt capital gains at maturity.",
      "Post Office National Savings Scheme (NSC): Secure, long-term capital protection.",
    ],
    moderate: [
      "Large-cap / Flexi-cap Index Funds: High correlation with Nifty 50, standard growth with minimal tracking errors.",
      "ELSS (Equity Linked Savings Scheme): Multi-cap allocations with 3-year lock-in period, saving Section 80C taxes.",
      "NPS (National Pension System): Added tax benefit up to ₹50,000 under Section 80CCD(1B).",
      "Dynamic Asset Allocation Funds: Auto-rebalance between debt and equity based on market conditions.",
    ],
    aggressive: [
      "Mid & Small Cap Direct Mutual Funds: Targeting high beta compounding for long duration goals.",
      "International Equity Index Funds: Exposure to US tech markets (S&P 500, Nasdaq 100) for currency hedge.",
      "Sectoral / Thematic Funds: Direct tactical allocations to Banking, Infrastructure, or Digital sectors.",
      "Direct Stock Portfolio via SIP: Quality bluechips compounded for wealth accumulation.",
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      {/* Col 1: Form Questionnaire */}
      <div className="p-6 glass-card space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-100 flex items-center gap-1.5">
            <GraduationCap className="w-5 h-5 text-blue-400" /> Goal & Investment Architect
          </h3>
          <p className="text-[11px] text-gray-400">Configure your wealth profiling targets for intelligent advisory</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Monthly Savings (₹)</label>
              <input
                type="number"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Risk Appetite Profile</label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="conservative">Conservative (Low Risk)</option>
                <option value="moderate">Moderate (Balanced)</option>
                <option value="aggressive">Aggressive (High Growth)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Investment Goal</label>
              <input
                type="text"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Emergency Reserves (Months)</label>
              <select
                value={emergencyFundMonths}
                onChange={(e) => setEmergencyFundMonths(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value={3}>3 Months Buffer</option>
                <option value={6}>6 Months Buffer</option>
                <option value={12}>12 Months Buffer</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SIP Duration (Years)</label>
              <input
                type="number"
                value={durationYears}
                onChange={(e) => setDurationYears(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-xs font-bold tracking-wider uppercase text-white rounded-xl transition-all shadow-md cursor-pointer"
          >
            Update Wealth Architecture Parameters
          </button>
        </form>
      </div>

      {/* Col 2: Projected Wealth & Customized Education Recommendations */}
      <div className="space-y-6">
        {/* Compound Interest Calculator Output */}
        <div className="p-5 glass-card space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" /> Projected Compounding Returns
          </h4>

          <div className="grid grid-cols-3 gap-3.5">
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[9px] text-gray-400 font-bold uppercase block">Total Invested</span>
              <span className="text-sm font-bold text-gray-200 font-mono">{formatRupee(totalInvested)}</span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[9px] text-gray-400 font-bold uppercase block">Interest Gained</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formatRupee(interestEarned)}</span>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-950/40 to-[#131f3a] rounded-xl border border-emerald-500/10">
              <span className="text-[9px] text-emerald-400 font-bold uppercase block">Future Wealth</span>
              <span className="text-sm font-bold text-white font-mono">{formatRupee(projectedValue)}</span>
            </div>
          </div>

          <div className="p-2.5 bg-white/[0.01] rounded-lg border border-white/5 text-[10px] text-gray-400 flex items-center gap-2">
            <Info size={14} className="text-blue-400 shrink-0" />
            <span>
              Compound calculation assumes an estimated annual compounding yield rate of{" "}
              <span className="text-white font-bold">
                {riskProfile === "conservative" ? "7% p.a." : riskProfile === "moderate" ? "11% p.a." : "14% p.a."}
              </span>{" "}
              over {durationYears} years based on your active risk appetite.
            </span>
          </div>
        </div>

        {/* Dynamic educational suggestion list based on active risk level */}
        <div className="p-5 glass-card space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> Tailored Asset Suggestions
          </h4>

          <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
            {adviceList[riskProfile].map((adv, idx) => {
              const parts = adv.split(":");
              return (
                <div key={idx} className="p-3 bg-slate-950/45 rounded-xl border border-white/5 space-y-1">
                  <h5 className="text-xs font-bold text-gray-200">{parts[0]}</h5>
                  <p className="text-[10px] text-gray-400 leading-normal">{parts[1]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
