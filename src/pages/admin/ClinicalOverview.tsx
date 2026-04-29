import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  ActivitySquare,
  ScanLine,
  Camera,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

export const ClinicalOverview = () => {
  const { employees } = useDemo();
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', ...Array.from(new Set(employees.map(e => e.department)))];
  const filtered = selectedDept === 'all' ? employees : employees.filter(e => e.department === selectedDept);

  const clinicalEmployees = employees.filter(e => e.clinicalAssessment);
  const avgMSK = Math.round(employees.reduce((acc, e) => acc + e.riskProfile.mskRiskScore, 0) / employees.length);
  const criticalMSK = employees.filter(e => e.riskProfile.mskRiskScore >= 65).length;
  const pendingReviews = clinicalEmployees.filter(e => e.clinicalAssessment?.status === 'pending').length;

  const bodyRegionStats = [
    { region: 'Lower Back', avgPain: 5.2, atRisk: 3 },
    { region: 'Shoulders', avgPain: 3.8, atRisk: 2 },
    { region: 'Neck', avgPain: 3.2, atRisk: 1 },
    { region: 'Knees', avgPain: 3.0, atRisk: 2 },
    { region: 'Hips', avgPain: 2.4, atRisk: 1 },
    { region: 'Ankles', avgPain: 1.8, atRisk: 1 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Clinical Overview</h1>
              <p className="text-xs text-slate-500">MSK & Body Assessment Data</p>
            </div>
          </div>
          <div className="flex gap-2">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedDept === dept ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept === 'all' ? 'All Depts' : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg MSK Risk', value: avgMSK, icon: ActivitySquare, color: avgMSK >= 65 ? 'red' : avgMSK >= 35 ? 'amber' : 'emerald', trend: '+3%' },
            { label: 'Critical MSK Cases', value: criticalMSK, icon: AlertTriangle, color: 'red', trend: '+1' },
            { label: 'Pending Reviews', value: pendingReviews, icon: Clock, color: 'amber', trend: null },
            { label: 'Assessments Done', value: clinicalEmployees.length, icon: CheckCircle2, color: 'indigo', trend: '+2' }
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${
                  kpi.color === 'red' ? 'bg-red-50' :
                  kpi.color === 'amber' ? 'bg-amber-50' :
                  kpi.color === 'emerald' ? 'bg-emerald-50' : 'bg-indigo-50'
                }`}>
                  <kpi.icon className={`w-4 h-4 ${
                    kpi.color === 'red' ? 'text-red-500' :
                    kpi.color === 'amber' ? 'text-amber-500' :
                    kpi.color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'
                  }`} />
                </div>
                {kpi.trend && (
                  <span className={`text-xs font-bold flex items-center ${kpi.trend.startsWith('+') ? 'text-red-500' : 'text-emerald-500'}`}>
                    {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Body Region Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Body Region Risk Heatmap</h2>
          <div className="grid grid-cols-6 gap-3">
            {bodyRegionStats.map(region => (
              <div
                key={region.region}
                className={`rounded-xl p-4 text-center border-2 ${
                  region.atRisk >= 3 ? 'bg-red-50 border-red-200' :
                  region.atRisk >= 2 ? 'bg-amber-50 border-amber-200' :
                  'bg-emerald-50 border-emerald-200'
                }`}
              >
                <p className="text-xs font-bold text-slate-600 mb-2">{region.region}</p>
                <p className={`text-2xl font-black ${
                  region.atRisk >= 3 ? 'text-red-600' :
                  region.atRisk >= 2 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {region.avgPain.toFixed(1)}
                </p>
                <p className="text-[10px] text-slate-400">avg pain</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1">{region.atRisk} at risk</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Types Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Assessment Types</h2>
            <div className="space-y-4">
              {[
                { type: 'MSK Risk Screen', count: 12, icon: ActivitySquare, color: 'indigo' },
                { type: '3D Motion Capture', count: 5, icon: ScanLine, color: 'emerald' },
                { type: 'Posture Analysis', count: 8, icon: Camera, color: 'violet' }
              ].map(item => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-${item.color}-50`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${item.color}-500`}
                        style={{ width: `${(item.count / 25) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-6">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Program Enrollment</h2>
            <div className="space-y-3">
              {[
                { program: 'Back Pain Management', enrolled: 8, capacity: 15, color: 'emerald' },
                { program: 'Ergonomic Assessment', enrolled: 5, capacity: 10, color: 'indigo' },
                { program: 'Physical Therapy', enrolled: 3, capacity: 8, color: 'amber' },
                { program: 'Gait Correction', enrolled: 2, capacity: 6, color: 'violet' }
              ].map(p => (
                <div key={p.program} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{p.program}</span>
                    <span className="text-slate-500">{p.enrolled}/{p.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${p.color}-500`}
                      style={{ width: `${(p.enrolled / p.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Clinical List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Employee Clinical Data</h2>
            <span className="text-xs text-slate-500">{filtered.length} employees</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">MSK Risk</th>
                  <th className="pb-3">Health Score</th>
                  <th className="pb-3">Assessment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              emp.riskProfile.mskRiskScore < 35 ? 'bg-emerald-500' :
                              emp.riskProfile.mskRiskScore < 65 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${emp.riskProfile.mskRiskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{emp.riskProfile.mskRiskScore}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-bold text-slate-900">{emp.overallHealthScore}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-slate-500">
                        {emp.clinicalAssessment ? emp.clinicalAssessment.type.replace('_', ' ') : 'None'}
                      </span>
                    </td>
                    <td className="py-3">
                      {emp.clinicalAssessment ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          emp.clinicalAssessment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          emp.clinicalAssessment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.clinicalAssessment.status.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/employee/${emp.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                      >
                        View <ChevronRight className="w-3 h-3 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
