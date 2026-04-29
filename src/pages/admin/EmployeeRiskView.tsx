import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ActivitySquare,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  HeartPulse,
  BrainCircuit,
  Clock,
  User,
  MapPin,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

export const EmployeeRiskView = () => {
  const { id } = useParams();
  const { employees, currentUser } = useDemo();
  const employee = employees.find(e => e.id === id) || employees[0];
  const { riskProfile } = employee;

  const isHR = ['HR', 'Admin'].includes(currentUser?.role || '');

  const riskScoreColor = (score: number) =>
    score < 30 ? 'text-emerald-600 bg-emerald-50' :
    score < 55 ? 'text-amber-600 bg-amber-50' :
    score < 75 ? 'text-orange-600 bg-orange-50' :
    'text-red-600 bg-red-50';

  const riskLevelBadge = (level: string) => {
    const map: Record<string, string> = {
      Low: 'bg-emerald-100 text-emerald-700',
      Medium: 'bg-amber-100 text-amber-700',
      High: 'bg-orange-100 text-orange-700',
      Critical: 'bg-red-100 text-red-700'
    };
    return map[level] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to="/hr" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="p-2 bg-indigo-100 rounded-xl">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{employee.name}</h1>
            <p className="text-xs text-slate-500">{employee.department} — {employee.position}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile & Risk Scores */}
        <div className="lg:col-span-1 space-y-4">
          {/* Employee Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-4">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-xl font-black text-slate-900">{employee.name}</h2>
            <p className="text-sm text-slate-500">{employee.position}</p>
            <p className="text-sm text-indigo-600 font-medium">{employee.department}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {employee.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Hired {new Date(employee.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Risk Scores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Risk Profile</h3>
            <div className="space-y-4">
              {[
                { label: 'Turnover Risk', score: riskProfile.predictiveAttritionRisk, level: riskProfile.turnoverRisk },
                { label: 'Burnout Score', score: riskProfile.burnoutScore, level: riskProfile.burnoutScore > 70 ? 'High' : riskProfile.burnoutScore > 40 ? 'Medium' : 'Low' },
                { label: 'MSK Risk', score: riskProfile.mskRiskScore, level: riskProfile.mskRiskScore > 65 ? 'High' : riskProfile.mskRiskScore > 35 ? 'Medium' : 'Low' },
                { label: 'Financial Risk', score: riskProfile.financialRiskScore, level: riskProfile.financialRiskScore > 60 ? 'High' : riskProfile.financialRiskScore > 30 ? 'Medium' : 'Low' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${riskScoreColor(item.score)}`}>
                        {item.score}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${riskLevelBadge(item.level)}`}>
                        {item.level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.score < 30 ? 'bg-emerald-500' :
                        item.score < 55 ? 'bg-amber-500' :
                        item.score < 75 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="font-bold">AI Insights</h3>
            </div>
            <ul className="space-y-2">
              {riskProfile.aiInsights.map((insight, i) => (
                <li key={i} className="text-sm text-indigo-100 flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 bg-indigo-300 rounded-full shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Clinical Data & Engagement */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clinical Assessment Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <HeartPulse className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Clinical Assessment</h3>
                  <p className="text-xs text-slate-500">Latest assessment from {employee.lastAssessmentDate ? new Date(employee.lastAssessmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>
              {employee.clinicalAssessment?.status && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  employee.clinicalAssessment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  employee.clinicalAssessment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {employee.clinicalAssessment.status.toUpperCase()}
                </span>
              )}
            </div>

            {employee.clinicalAssessment ? (
              <div className="space-y-4">
                {employee.clinicalAssessment.mskData && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-slate-800">MSK Screen Results</h4>
                      <span className={`text-sm font-black ${
                        employee.clinicalAssessment.mskData.riskLevel === 'Low' ? 'text-emerald-600' :
                        employee.clinicalAssessment.mskData.riskLevel === 'Moderate' ? 'text-amber-600' :
                        employee.clinicalAssessment.mskData.riskLevel === 'High' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {employee.clinicalAssessment.mskData.riskLevel} Risk
                      </span>
                    </div>
                    {/* Body region map */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {employee.clinicalAssessment.mskData.regions.map(region => (
                        <div key={region.name} className="text-center p-2 bg-white rounded-lg border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{region.name.replace('_', ' ')}</p>
                          <p className={`text-lg font-black ${
                            region.painLevel < 3 ? 'text-emerald-600' :
                            region.painLevel < 6 ? 'text-amber-600' : 'text-red-600'
                          }`}>{region.painLevel}</p>
                          <p className="text-[9px] text-slate-400">pain</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {employee.clinicalAssessment.mskData.recommendations.map((rec, i) => (
                        <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.clinicalAssessment.motionData && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-bold text-slate-800 mb-3">Motion Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-xl">
                        <p className="text-xs text-slate-500">Mobility Score</p>
                        <p className="text-2xl font-black text-slate-900">{employee.clinicalAssessment.motionData.overallMobilityScore}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl">
                        <p className="text-xs text-slate-500">Asymmetry Index</p>
                        <p className="text-2xl font-black text-slate-900">{employee.clinicalAssessment.motionData.asymmetryIndex}%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {employee.clinicalAssessment.motionData.riskFlags.map((flag, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <HeartPulse className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No clinical assessment on file</p>
              </div>
            )}
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Engagement & Attendance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Engagement</p>
                <p className="text-3xl font-black text-emerald-700">{riskProfile.engagementScore}</p>
                <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${riskProfile.engagementScore}%` }} />
                </div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-600 font-bold uppercase mb-1">Absent. Index</p>
                <p className="text-3xl font-black text-amber-700">{riskProfile.absenteeismIndex}</p>
                <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${riskProfile.absenteeismIndex}%` }} />
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold uppercase mb-1">Health Score</p>
                <p className="text-3xl font-black text-slate-700">{employee.overallHealthScore}</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: `${employee.overallHealthScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              {[
                { action: 'Schedule ergonomic assessment', priority: 'High', color: 'red' },
                { action: 'Refer to physical therapy', priority: 'High', color: 'red' },
                { action: 'Schedule 1-on-1 wellness check-in', priority: 'Medium', color: 'amber' },
                { action: 'Assign to light duty rotation', priority: 'Medium', color: 'amber' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">{item.action}</span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                    item.color === 'red' ? 'bg-red-100 text-red-700' :
                    item.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
