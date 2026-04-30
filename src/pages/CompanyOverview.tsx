import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  Download,
  Building2,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDemo } from '../store/DemoContext';
import type { DepartmentRiskSummary, RiskDistribution, Intervention } from '../types/clinical';

const RECENT_INTERVENTIONS: Intervention[] = [
  {
    id: 'int-1',
    employeeId: 'emp-1',
    employeeName: 'Robert Wilson',
    department: 'Operations',
    type: 'MSK Management',
    program: 'Back Pain Management Program',
    status: 'In Progress',
    startDate: '2026-04-20',
    progress: 35,
    nextSession: 'Tomorrow, 2:00 PM',
    aiRecommended: true,
    outcomes: []
  },
  {
    id: 'int-2',
    employeeId: 'emp-5',
    employeeName: 'James Thompson',
    department: 'Operations',
    type: 'Acute Care',
    program: 'Urgent Medical Evaluation',
    status: 'Pending',
    startDate: '2026-04-22',
    progress: 0,
    nextSession: 'Scheduled for Apr 24',
    aiRecommended: true,
    outcomes: []
  },
  {
    id: 'int-3',
    employeeId: 'emp-3',
    employeeName: 'Michael Chang',
    department: 'Food & Beverage',
    type: 'Mobility',
    program: 'Gait Correction Program',
    status: 'In Progress',
    startDate: '2026-04-10',
    progress: 60,
    nextSession: 'Today, 4:00 PM',
    aiRecommended: false,
    outcomes: []
  },
  {
    id: 'int-4',
    employeeId: 'emp-2',
    employeeName: 'Sarah Jenkins',
    department: 'Operations',
    type: 'Wellness',
    program: 'Leadership Development',
    status: 'Completed',
    startDate: '2026-03-01',
    progress: 100,
    aiRecommended: false,
    outcomes: []
  },
  {
    id: 'int-5',
    employeeId: 'emp-4',
    employeeName: 'Emily Rodriguez',
    department: 'HR',
    type: 'Wellness',
    program: 'Stress Management Workshop',
    status: 'In Progress',
    startDate: '2026-04-15',
    progress: 50,
    nextSession: 'Friday, 10:00 AM',
    aiRecommended: true,
    outcomes: []
  }
];

const getRiskLevelLabel = (score: number): string => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

const getRiskLevelColor = (level: string): string => {
  switch (level) {
    case 'Critical': return 'text-red-600 bg-red-50';
    case 'High': return 'text-red-500 bg-red-50';
    case 'Moderate': return 'text-amber-500 bg-amber-50';
    case 'Low': return 'text-emerald-500 bg-emerald-50';
    default: return 'text-slate-500 bg-slate-50';
  }
};

const getRiskBarColor = (level: string): string => {
  switch (level) {
    case 'Critical': return 'bg-red-500';
    case 'High': return 'bg-red-400';
    case 'Moderate': return 'bg-amber-400';
    case 'Low': return 'bg-emerald-400';
    default: return 'bg-slate-400';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'In Progress': return 'bg-emerald-100 text-emerald-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Completed': return 'bg-indigo-100 text-indigo-700';
    case 'Cancelled': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export const CompanyOverview = () => {
  const { employees } = useDemo();
  const [exporting, setExporting] = useState(false);

  // Company stats
  const totalEmployees = employees.length;

  const avgRiskScore = useMemo(() => {
    return Math.round(
      employees.reduce((acc, e) => acc + e.riskProfile.mskRiskScore, 0) / employees.length
    );
  }, [employees]);

  const highRiskCount = useMemo(() => {
    return employees.filter(e => e.riskProfile.mskRiskScore >= 70).length;
  }, [employees]);

  const activeInterventions = RECENT_INTERVENTIONS.filter(
    i => i.status === 'In Progress' || i.status === 'Pending'
  ).length;

  // Department breakdown
  const departmentBreakdown: DepartmentRiskSummary[] = useMemo(() => {
    const deptMap = new Map<string, { scores: number[]; employees: typeof employees }>();

    employees.forEach(emp => {
      const existing = deptMap.get(emp.department) || { scores: [], employees: [] };
      existing.scores.push(emp.riskProfile.mskRiskScore);
      existing.employees.push(emp);
      deptMap.set(emp.department, existing);
    });

    return Array.from(deptMap.entries()).map(([name, data]) => {
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const highRisks = data.scores.filter(s => s >= 70).length;
      const moderateRisks = data.scores.filter(s => s >= 40 && s < 70).length;
      const lowRisks = data.scores.filter(s => s < 40).length;

      let deptRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
      if (avgScore >= 70) deptRiskLevel = 'Critical';
      else if (avgScore >= 55) deptRiskLevel = 'High';
      else if (avgScore >= 40) deptRiskLevel = 'Moderate';

      return {
        name,
        employeeCount: data.employees.length,
        avgRiskScore: avgScore,
        highRiskCount: highRisks,
        moderateRiskCount: moderateRisks,
        lowRiskCount: lowRisks,
        departmentRiskLevel: deptRiskLevel
      };
    }).sort((a, b) => b.avgRiskScore - a.avgRiskScore);
  }, [employees]);

  // Risk distribution
  const riskDistribution: RiskDistribution = useMemo(() => {
    const dist: RiskDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
    employees.forEach(e => {
      const score = e.riskProfile.mskRiskScore;
      if (score >= 70) dist.critical++;
      else if (score >= 55) dist.high++;
      else if (score >= 40) dist.moderate++;
      else dist.low++;
    });
    return dist;
  }, [employees]);

  const maxDist = Math.max(
    riskDistribution.low,
    riskDistribution.moderate,
    riskDistribution.high,
    riskDistribution.critical
  );

  // Recent interventions (last 5)
  const recentInterventions = RECENT_INTERVENTIONS.slice(0, 5);

  // Export CSV
  const handleExportCSV = () => {
    setExporting(true);
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Position',
      'MSK Risk Score',
      'Risk Level',
      'Burnout Score',
      'Turnover Risk',
      'Compliance Status',
      'Last Assessment',
      'Overall Health Score'
    ];

    const rows = employees.map(e => [
      e.id,
      e.name,
      e.department,
      e.position,
      e.riskProfile.mskRiskScore,
      getRiskLevelLabel(e.riskProfile.mskRiskScore),
      e.riskProfile.burnoutScore,
      e.riskProfile.turnoverRisk,
      e.riskProfile.complianceStatus,
      e.lastAssessmentDate || 'N/A',
      e.overallHealthScore
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee_risk_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const avgRiskTrend = avgRiskScore >= 50 ? '+2.3%' : '-1.8%';
  const riskTrendPositive = avgRiskScore < 50;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Company Overview</h1>
              <p className="text-xs text-slate-500">Enterprise Risk Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Employees',
              value: totalEmployees,
              icon: Users,
              color: 'indigo',
              trend: null,
              bgColor: 'bg-indigo-50'
            },
            {
              label: 'Avg MSK Risk Score',
              value: avgRiskScore,
              icon: TrendingUp,
              color: avgRiskScore >= 55 ? 'red' : avgRiskScore >= 40 ? 'amber' : 'emerald',
              trend: avgRiskTrend,
              bgColor: avgRiskScore >= 55 ? 'bg-red-50' : avgRiskScore >= 40 ? 'bg-amber-50' : 'bg-emerald-50'
            },
            {
              label: 'High Risk Employees',
              value: highRiskCount,
              icon: AlertTriangle,
              color: 'red',
              trend: highRiskCount > 2 ? '+1 this week' : null,
              bgColor: 'bg-red-50'
            },
            {
              label: 'Active Interventions',
              value: activeInterventions,
              icon: BrainCircuit,
              color: 'violet',
              trend: null,
              bgColor: 'bg-violet-50'
            }
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className={`p-2 rounded-xl ${kpi.bgColor} mb-3 inline-block`}>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-500`} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
                </div>
                {kpi.trend && (
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${
                    riskTrendPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {riskTrendPositive ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                    {kpi.trend}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Breakdown Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Department Risk Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">Department</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">Employees</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">Avg Risk</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">High</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">Moderate</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">Low</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-3">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentBreakdown.map((dept, i) => (
                    <motion.tr
                      key={dept.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3">
                        <span className="font-semibold text-slate-900">{dept.name}</span>
                      </td>
                      <td className="py-3 text-center text-sm text-slate-600">{dept.employeeCount}</td>
                      <td className="py-3 text-center">
                        <span className="font-bold text-slate-900">{dept.avgRiskScore}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-bold ${
                          dept.highRiskCount > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {dept.highRiskCount}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-bold ${
                          dept.moderateRiskCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {dept.moderateRiskCount}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          {dept.lowRiskCount}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskLevelColor(dept.departmentRiskLevel)}`}>
                          {dept.departmentRiskLevel}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-500" />
              Risk Distribution
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Critical (70+)', count: riskDistribution.critical, level: 'Critical' },
                { label: 'High (55-69)', count: riskDistribution.high, level: 'High' },
                { label: 'Moderate (40-54)', count: riskDistribution.moderate, level: 'Moderate' },
                { label: 'Low (0-39)', count: riskDistribution.low, level: 'Low' }
              ].map((item) => {
                const percentage = maxDist > 0 ? (item.count / maxDist) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">
                        {item.count}
                        <span className="text-slate-400 font-normal ml-1">
                          ({totalEmployees > 0 ? Math.round((item.count / totalEmployees) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`h-3 rounded-full ${getRiskBarColor(item.level)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-slate-500">Low Risk (0-39)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-slate-500">Moderate (40-54)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-slate-500">High (55-69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-slate-500">Critical (70+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Interventions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-violet-500" />
              Recent Interventions
            </h2>
            <span className="text-xs text-slate-400">Last 5 active programs</span>
          </div>
          <div className="space-y-3">
            {recentInterventions.map((intervention, i) => (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    intervention.status === 'In Progress' ? 'bg-emerald-50' :
                    intervention.status === 'Pending' ? 'bg-amber-50' :
                    intervention.status === 'Completed' ? 'bg-indigo-50' : 'bg-slate-100'
                  }`}>
                    {intervention.status === 'In Progress' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                    {intervention.status === 'Pending' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {intervention.status === 'Completed' && <Users className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{intervention.employeeName}</span>
                      {intervention.aiRecommended && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-black rounded-full">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-indigo-600">{intervention.program}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{intervention.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-500">
                      {intervention.nextSession || (intervention.status === 'Completed' ? 'Completed' : 'Not scheduled')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Started {new Date(intervention.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(intervention.status)}`}>
                    {intervention.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
