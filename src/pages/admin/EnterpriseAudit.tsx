import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  ActivitySquare,
  ScanLine
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

export const EnterpriseAudit = () => {
  const { employees, companyHealthScore, criticalRiskCount, avgMSKRisk, avgBurnoutScore } = useDemo();

  const avgTurnoverRisk = Math.round(employees.reduce((acc, e) => acc + e.riskProfile.predictiveAttritionRisk, 0) / employees.length);
  const avgEngagement = Math.round(employees.reduce((acc, e) => acc + e.riskProfile.engagementScore, 0) / employees.length);
  const highBurnout = employees.filter(e => e.riskProfile.burnoutScore > 65).length;

  // Department breakdown
  const deptData = ['Operations', 'Food & Beverage', 'HR'].map(dept => {
    const emps = employees.filter(e => e.department === dept);
    return {
      name: dept,
      headcount: emps.length,
      avgMSK: Math.round(emps.reduce((acc, e) => acc + e.riskProfile.mskRiskScore, 0) / emps.length),
      avgBurnout: Math.round(emps.reduce((acc, e) => acc + e.riskProfile.burnoutScore, 0) / emps.length),
      criticalCount: emps.filter(e => e.riskProfile.turnoverRisk === 'High' || e.riskProfile.turnoverRisk === 'Critical').length
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/30 rounded-xl">
              <BarChart3 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Enterprise Audit</h1>
              <p className="text-xs text-slate-400">Company-Wide Risk & Clinical Overview</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Last Updated</p>
            <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Company Health', value: companyHealthScore, icon: HeartPulse, trend: '+2%', up: true, suffix: '' },
            { label: 'Critical Risk', value: criticalRiskCount, icon: AlertTriangle, trend: '+1', up: false, suffix: '' },
            { label: 'Avg MSK Risk', value: avgMSKRisk, icon: ActivitySquare, trend: '+5', up: false, suffix: '' },
            { label: 'Avg Burnout', value: avgBurnoutScore, icon: BrainCircuit, trend: '+8', up: false, suffix: '' },
            { label: 'Avg Turnover Risk', value: avgTurnoverRisk, icon: TrendingUp, trend: '+3', up: false, suffix: '' },
            { label: 'Avg Engagement', value: avgEngagement, icon: Users, trend: '-4', up: false, suffix: '' }
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${
                  i === 0 ? 'bg-emerald-50' :
                  i === 1 || i === 2 || i === 3 || i === 4 ? 'bg-red-50' : 'bg-indigo-50'
                }`}>
                  <kpi.icon className={`w-4 h-4 ${
                    i === 0 ? 'text-emerald-600' :
                    i === 1 || i === 2 || i === 3 || i === 4 ? 'text-red-500' : 'text-indigo-500'
                  }`} />
                </div>
                <span className={`text-[10px] font-bold flex items-center ${
                  kpi.trend.startsWith('+') && i === 0 ? 'text-emerald-600' :
                  kpi.trend.startsWith('+') ? 'text-red-500' : 'text-amber-600'
                }`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{kpi.value}{kpi.suffix}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Department Risk Breakdown</h2>
          <div className="space-y-4">
            {deptData.map(dept => (
              <div key={dept.name} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{dept.name}</h3>
                      <p className="text-xs text-slate-500">{dept.headcount} employees</p>
                    </div>
                  </div>
                  {dept.criticalCount > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {dept.criticalCount} Critical
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">MSK Risk</span>
                      <span className="font-bold text-slate-700">{dept.avgMSK}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          dept.avgMSK < 35 ? 'bg-emerald-500' :
                          dept.avgMSK < 65 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${dept.avgMSK}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Burnout</span>
                      <span className="font-bold text-slate-700">{dept.avgBurnout}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          dept.avgBurnout < 40 ? 'bg-emerald-500' :
                          dept.avgBurnout < 65 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${dept.avgBurnout}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Risk Distribution</h2>
          <div className="space-y-3">
            {[
              { label: 'Critical Risk', count: employees.filter(e => e.riskProfile.turnoverRisk === 'Critical').length, color: 'bg-red-500', width: 20 },
              { label: 'High Risk', count: employees.filter(e => e.riskProfile.turnoverRisk === 'High').length, color: 'bg-orange-500', width: 40 },
              { label: 'Medium Risk', count: employees.filter(e => e.riskProfile.turnoverRisk === 'Medium').length, color: 'bg-amber-500', width: 20 },
              { label: 'Low Risk', count: employees.filter(e => e.riskProfile.turnoverRisk === 'Low').length, color: 'bg-emerald-500', width: 20 }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 w-28">{item.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${item.width}%` }}
                  >
                    <span className="text-xs font-black text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <BrainCircuit className="w-6 h-6" />
            <h2 className="text-xl font-bold">AI Strategic Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { priority: 'HIGH', title: 'Address Critical MSK Cases', desc: '3 employees showing critical MSK risk scores. Recommend immediate ergonomic and clinical intervention.', icon: AlertTriangle },
              { priority: 'MEDIUM', title: 'Operations Dept Intervention', desc: 'Operations department shows 28% higher burnout than average. Consider workload redistribution.', icon: TrendingUp },
              { priority: 'LOW', title: 'Recognition Program', desc: 'Low engagement scores in high-turnover-risk roles. A recognition program could improve retention by 15%.', icon: CheckCircle2 }
            ].map(rec => (
              <div key={rec.title} className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    rec.priority === 'HIGH' ? 'bg-red-500/30 text-red-200' :
                    rec.priority === 'MEDIUM' ? 'bg-amber-500/30 text-amber-200' : 'bg-emerald-500/30 text-emerald-200'
                  }`}>
                    {rec.priority} PRIORITY
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1">{rec.title}</h3>
                <p className="text-sm text-indigo-200 leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
