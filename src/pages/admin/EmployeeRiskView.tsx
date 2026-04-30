import React, { useEffect, useState } from 'react';
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
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

const API_BASE = 'http://localhost:3000/api';

interface EmployeeData {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  hrRisk?: {
    id: number;
    employee_id: number;
    turnover_risk: string;
    motivation_level: number;
    performance_score: number;
    sick_days: number;
    notes: string;
    updated_at: string;
  };
  clinicalAssessments?: Array<{
    id: number;
    employee_id: number;
    type: string;
    data_json: any;
    risk_score: number;
    risk_level: string;
    created_at: string;
  }>;
  interventions?: Array<{
    id: number;
    employee_id: number;
    type: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

export const EmployeeRiskView = () => {
  const { id } = useParams();
  const { currentUser } = useDemo();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Employee not found');
        } else {
          throw new Error('Failed to fetch employee');
        }
        return;
      }
      const data = await res.json();
      setEmployee(data);
    } catch (err: any) {
      console.error('Error fetching employee:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  // Access control — HR and Admin only
  const isHR = ['HR', 'Admin'].includes(currentUser?.role || '');
  if (!isHR) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p className="text-sm font-medium">Access restricted to HR and Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-sm font-medium">{error || 'Employee not found'}</p>
        <Link to="/hr" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          Return to HR Dashboard
        </Link>
      </div>
    );
  }

  const hrRisk = employee.hrRisk;
  const latestAssessment = employee.clinicalAssessments?.[0];
  const assessmentData = latestAssessment?.data_json;

  // Derive risk values
  const turnoverRisk = hrRisk?.turnover_risk || 'Low';
  const burnoutScore = Math.max(0, 100 - (hrRisk?.motivation_level || 70));
  const mskRiskScore = assessmentData?.totalRiskScore || 30;
  const financialRiskScore = 25;
  const engagementScore = hrRisk?.motivation_level || 70;
  const absenteeismIndex = Math.min(100, (hrRisk?.sick_days || 0) * 10);
  const predictiveAttritionRisk = turnoverRisk === 'High' ? 75 : turnoverRisk === 'Medium' ? 45 : 15;

  const aiInsights = hrRisk?.notes ? [hrRisk.notes] : [];

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

  const getRiskLevel = (score: number): string => {
    if (score < 30) return 'Low';
    if (score < 55) return 'Medium';
    if (score < 75) return 'High';
    return 'Critical';
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
          <button 
            onClick={fetchEmployee}
            className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
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
                Hired {new Date(employee.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Risk Scores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Risk Profile</h3>
            <div className="space-y-4">
              {[
                { label: 'Turnover Risk', score: predictiveAttritionRisk, level: getRiskLevel(predictiveAttritionRisk) },
                { label: 'Burnout Score', score: burnoutScore, level: getRiskLevel(burnoutScore) },
                { label: 'MSK Risk', score: mskRiskScore, level: getRiskLevel(mskRiskScore) },
                { label: 'Financial Risk', score: financialRiskScore, level: getRiskLevel(financialRiskScore) }
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
              {aiInsights.length > 0 ? aiInsights.map((insight: string, i: number) => (
                <li key={i} className="text-sm text-indigo-100 flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 bg-indigo-300 rounded-full shrink-0" />
                  {insight}
                </li>
              )) : (
                <li className="text-sm text-indigo-100 flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 bg-indigo-300 rounded-full shrink-0" />
                  No insights available yet.
                </li>
              )}
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
                  <p className="text-xs text-slate-500">
                    Latest assessment from {latestAssessment 
                      ? new Date(latestAssessment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
              {latestAssessment && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  latestAssessment.risk_level === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                  latestAssessment.risk_level === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                  latestAssessment.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {latestAssessment.risk_level.toUpperCase()} RISK
                </span>
              )}
            </div>

            {assessmentData ? (
              <div className="space-y-4">
                {assessmentData.regions && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-slate-800">MSK Screen Results</h4>
                      <span className={`text-sm font-black ${
                        assessmentData.riskLevel === 'Low' ? 'text-emerald-600' :
                        assessmentData.riskLevel === 'Moderate' ? 'text-amber-600' :
                        assessmentData.riskLevel === 'High' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {assessmentData.riskLevel} Risk
                      </span>
                    </div>
                    {/* Body region map */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {assessmentData.regions.map((region: any) => (
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
                    {assessmentData.recommendations && (
                      <div className="flex flex-wrap gap-2">
                        {assessmentData.recommendations.map((rec: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">
                            {rec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {assessmentData.movementTests && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-bold text-slate-800 mb-3">Motion Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-xl">
                        <p className="text-xs text-slate-500">Mobility Score</p>
                        <p className="text-2xl font-black text-slate-900">{assessmentData.overallMobilityScore}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl">
                        <p className="text-xs text-slate-500">Asymmetry Index</p>
                        <p className="text-2xl font-black text-slate-900">{assessmentData.asymmetryIndex}%</p>
                      </div>
                    </div>
                    {assessmentData.riskFlags && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {assessmentData.riskFlags.map((flag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
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
                <p className="text-3xl font-black text-emerald-700">{engagementScore}</p>
                <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${engagementScore}%` }} />
                </div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-600 font-bold uppercase mb-1">Absent. Index</p>
                <p className="text-3xl font-black text-amber-700">{absenteeismIndex}</p>
                <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${absenteeismIndex}%` }} />
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold uppercase mb-1">Health Score</p>
                <p className="text-3xl font-black text-slate-700">{Math.round((100 - burnoutScore + (100 - mskRiskScore)) / 2)}</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: `${Math.round((100 - burnoutScore + (100 - mskRiskScore)) / 2)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Actions — derived from actual risk scores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              {(() => {
                const actions: { action: string; priority: 'High' | 'Medium' | 'Low'; color: 'red' | 'amber' | 'emerald' }[] = [];
                if (mskRiskScore > 65) actions.push({ action: 'Ergonomic workstation assessment', priority: 'High', color: 'red' });
                if (mskRiskScore > 65) actions.push({ action: 'Physical therapy referral', priority: 'High', color: 'red' });
                if (burnoutScore > 65) actions.push({ action: 'Schedule wellness check-in', priority: 'High', color: 'red' });
                if (burnoutScore > 40) actions.push({ action: 'Employee assistance program (EAP) referral', priority: 'Medium', color: 'amber' });
                if (predictiveAttritionRisk > 65) actions.push({ action: 'Stay interview with manager', priority: 'High', color: 'red' });
                if (predictiveAttritionRisk > 40) actions.push({ action: 'Career development conversation', priority: 'Medium', color: 'amber' });
                if (absenteeismIndex > 20) actions.push({ action: 'Review attendance patterns', priority: 'Medium', color: 'amber' });
                if (financialRiskScore > 60) actions.push({ action: 'Financial wellness consultation', priority: 'Medium', color: 'amber' });
                if (actions.length === 0) actions.push({ action: 'Continue monitoring — no elevated risk flags', priority: 'Low', color: 'emerald' });
                return actions.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">{item.action}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      item.color === 'red' ? 'bg-red-100 text-red-700' :
                      item.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Interventions */}
          {employee.interventions && employee.interventions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Active Interventions</h3>
              <div className="space-y-3">
                {employee.interventions.map((intervention) => (
                  <div key={intervention.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{intervention.description}</span>
                      <p className="text-xs text-slate-400 mt-1">Type: {intervention.type}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      intervention.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      intervention.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {intervention.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
