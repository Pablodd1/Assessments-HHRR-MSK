import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Calculator,
  ChevronLeft,
  RefreshCcw,
  BarChart3,
  Building2,
  Zap,
  PieChart
} from 'lucide-react';

interface CostInput {
  totalEmployees: number;
  avgSalary: number;
  avgSickDaysPerYear: number;
  avgLateMinutesPerWeek: number;
  overtimeRate: number;
  doubleShiftFrequency: number;
  turnoverRate: number;
  recruitmentCost: number;
  trainingWeeks: number;
}

const DEFAULT_INPUTS: CostInput = {
  totalEmployees: 150,
  avgSalary: 52000,
  avgSickDaysPerYear: 8,
  avgLateMinutesPerWeek: 15,
  overtimeRate: 1.5,
  doubleShiftFrequency: 12,
  turnoverRate: 18,
  recruitmentCost: 4500,
  trainingWeeks: 6,
};

export const CostCalculator = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<CostInput>(DEFAULT_INPUTS);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const updateInput = (key: keyof CostInput, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  // ─── Calculations ───
  const dailyRate = inputs.avgSalary / 260;
  const coverageCostMultiplier = 1.5; // Overtime to cover absence

  // Sick Day Costs
  const directSickCost = dailyRate * inputs.avgSickDaysPerYear * inputs.totalEmployees;
  const coverageCost = dailyRate * coverageCostMultiplier * inputs.avgSickDaysPerYear * inputs.totalEmployees * 0.7; // 70% need coverage
  const totalSickCost = directSickCost + coverageCost;

  // Lateness Costs
  const lateHoursPerYear = (inputs.avgLateMinutesPerWeek / 60) * 52;
  const latenessCostPerEmployee = (inputs.avgSalary / 2080) * lateHoursPerYear;
  const totalLatenessCost = latenessCostPerEmployee * inputs.totalEmployees;

  // Double Shift / Overtime Costs
  const doubleShiftCostPerInstance = dailyRate * inputs.overtimeRate;
  const totalOvertimeCost = doubleShiftCostPerInstance * inputs.doubleShiftFrequency * inputs.totalEmployees * 0.15; // 15% of staff affected

  // Cascade Effect (Burnout from covering)
  const cascadeMultiplier = 3.2; // Each absence triggers 3.2x downstream effects
  const cascadeCost = (totalSickCost * 0.3) * cascadeMultiplier; // 30% of sick costs cascade

  // Turnover Costs
  const annualTurnover = Math.round(inputs.totalEmployees * (inputs.turnoverRate / 100));
  const costPerTurnover = inputs.recruitmentCost + (dailyRate * inputs.trainingWeeks * 5) + (inputs.avgSalary * 0.5); // recruitment + training + lost productivity
  const totalTurnoverCost = annualTurnover * costPerTurnover;

  // Presenteeism (employees present but unproductive)
  const presenteeismRate = 0.12; // 12% productivity loss on average
  const totalPresenteeismCost = inputs.avgSalary * presenteeismRate * inputs.totalEmployees;

  // Grand Total
  const grandTotal = totalSickCost + totalLatenessCost + totalOvertimeCost + cascadeCost + totalTurnoverCost + totalPresenteeismCost;
  const costPerEmployee = grandTotal / inputs.totalEmployees;
  const monthlyTotal = grandTotal / 12;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  const costBreakdown = [
    { label: 'Sick Day Direct + Coverage', value: totalSickCost, color: 'bg-red-500', pct: (totalSickCost / grandTotal) * 100 },
    { label: 'Turnover & Replacement', value: totalTurnoverCost, color: 'bg-purple-500', pct: (totalTurnoverCost / grandTotal) * 100 },
    { label: 'Presenteeism (Low Productivity)', value: totalPresenteeismCost, color: 'bg-amber-500', pct: (totalPresenteeismCost / grandTotal) * 100 },
    { label: 'Cascade Effect (Burnout Ripple)', value: cascadeCost, color: 'bg-pink-500', pct: (cascadeCost / grandTotal) * 100 },
    { label: 'Overtime / Double Shifts', value: totalOvertimeCost, color: 'bg-blue-500', pct: (totalOvertimeCost / grandTotal) * 100 },
    { label: 'Lateness Impact', value: totalLatenessCost, color: 'bg-orange-500', pct: (totalLatenessCost / grandTotal) * 100 },
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-emerald-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hr/assessment')} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Calculator className="w-6 h-6 text-emerald-600" />
                </div>
                Employer Cost Calculator
              </h1>
              <p className="text-gray-500 mt-1">Quantify the true cost of absenteeism, turnover, and the vicious cycle</p>
            </div>
          </div>
          <button
            onClick={() => setInputs(DEFAULT_INPUTS)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Annual Total Loss</p>
            <p className="text-3xl font-black mt-2">{formatCurrency(grandTotal)}</p>
            <p className="text-xs mt-1 text-white/60">All workforce inefficiency costs</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Monthly Burn</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(monthlyTotal)}</p>
            <p className="text-xs mt-1 text-gray-400">Per month average</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Per Employee</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(costPerEmployee)}</p>
            <p className="text-xs mt-1 text-gray-400">Annual cost per head</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Turnover Loss</p>
            <p className="text-3xl font-black text-purple-600 mt-2">{annualTurnover}</p>
            <p className="text-xs mt-1 text-gray-400">Employees lost/year</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Company Parameters
            </h2>
            <div className="space-y-4">
              {[
                { key: 'totalEmployees' as const, label: 'Total Employees', icon: Users, min: 10, max: 5000, step: 10 },
                { key: 'avgSalary' as const, label: 'Avg Annual Salary ($)', icon: DollarSign, min: 25000, max: 200000, step: 1000 },
                { key: 'avgSickDaysPerYear' as const, label: 'Avg Sick Days / Year', icon: Clock, min: 0, max: 30, step: 1 },
                { key: 'avgLateMinutesPerWeek' as const, label: 'Avg Late Min / Week', icon: AlertTriangle, min: 0, max: 120, step: 5 },
                { key: 'doubleShiftFrequency' as const, label: 'Double Shifts / Year (per affected)', icon: RefreshCcw, min: 0, max: 52, step: 1 },
                { key: 'turnoverRate' as const, label: 'Annual Turnover Rate (%)', icon: TrendingUp, min: 0, max: 50, step: 1 },
                { key: 'recruitmentCost' as const, label: 'Recruitment Cost / Hire ($)', icon: DollarSign, min: 1000, max: 30000, step: 500 },
                { key: 'trainingWeeks' as const, label: 'Training Weeks for New Hire', icon: Zap, min: 1, max: 24, step: 1 },
              ].map(({ key, label, icon: Icon, min, max, step }) => (
                <div key={key}>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Icon className="w-3 h-3" />
                    {label}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={inputs[key]}
                      onChange={(e) => updateInput(key, Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <input
                      type="number"
                      value={inputs[key]}
                      onChange={(e) => updateInput(key, Number(e.target.value))}
                      className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Cost Breakdown
              </h2>
              
              {/* Stacked Bar */}
              <div className="w-full h-8 rounded-full overflow-hidden flex mb-6">
                {costBreakdown.map((item, i) => (
                  <motion.div
                    key={item.label}
                    className={`${item.color} h-full relative group`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-white">{item.pct.toFixed(0)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend + Values */}
              <div className="space-y-3">
                {costBreakdown.sort((a, b) => b.value - a.value).map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <motion.div
                          className={`h-full rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right">{formatCurrency(item.value)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Vicious Cycle Cost</p>
                  <p className="text-xl font-black">{formatCurrency(cascadeCost)}</p>
                  <p className="text-xs text-white/70 mt-1">Each absence triggers {cascadeMultiplier}x downstream effects</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Cost Per Turnover</p>
                  <p className="text-xl font-black">{formatCurrency(costPerTurnover)}</p>
                  <p className="text-xs text-white/70 mt-1">Recruitment + training + lost productivity</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Lateness = Salary Loss</p>
                  <p className="text-xl font-black">{formatCurrency(latenessCostPerEmployee)}/emp</p>
                  <p className="text-xs text-white/70 mt-1">{lateHoursPerYear.toFixed(1)} hours lost per employee/year</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">ROI if 20% Reduced</p>
                  <p className="text-xl font-black text-emerald-300">{formatCurrency(grandTotal * 0.2)}</p>
                  <p className="text-xs text-white/70 mt-1">Potential annual savings with intervention</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">AI Recommendations</h2>
              <div className="space-y-3">
                {[
                  { priority: 'Critical', text: 'Implement fair coverage rotation to break the cascade cycle', color: 'border-red-200 bg-red-50' },
                  { priority: 'High', text: 'Deploy nutrition & sleep assessment — energy crashes driving 35% of presenteeism', color: 'border-amber-200 bg-amber-50' },
                  { priority: 'High', text: 'Offer flex-time window (±30 min) to reduce lateness by estimated 60%', color: 'border-amber-200 bg-amber-50' },
                  { priority: 'Medium', text: 'Cross-train staff in 2 adjacent roles to reduce double-shift dependency', color: 'border-blue-200 bg-blue-50' },
                  { priority: 'Medium', text: 'Introduce mandatory 24hr rest after double shift coverage', color: 'border-blue-200 bg-blue-50' },
                ].map((rec, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${rec.color} flex items-start gap-3`}>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.priority === 'Critical' ? 'bg-red-600 text-white' :
                      rec.priority === 'High' ? 'bg-amber-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>{rec.priority}</span>
                    <p className="text-sm font-medium text-gray-800">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
