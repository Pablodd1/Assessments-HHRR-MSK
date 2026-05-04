import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  Building2,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  RefreshCcw,
  ChevronRight,
  Filter,
  Search,
  PieChart,
  Zap
} from 'lucide-react';

interface DepartmentData {
  id: string;
  name: string;
  headCount: number;
  departmentHead: string;
  avgSickDays: number;
  avgLateness: number;
  turnoverRate: number;
  engagementScore: number;
  assessmentCompletion: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  topIssues: string[];
  monthlyCost: number;
  cascadeScore: number;
}

const DEPARTMENTS: DepartmentData[] = [
  {
    id: 'ops',
    name: 'Operations',
    headCount: 45,
    departmentHead: 'Maria Torres',
    avgSickDays: 9.2,
    avgLateness: 22,
    turnoverRate: 24,
    engagementScore: 52,
    assessmentCompletion: 78,
    riskLevel: 'High',
    topIssues: ['Double shift fatigue', 'Scheduling conflicts', 'Physical strain'],
    monthlyCost: 18500,
    cascadeScore: 4.1
  },
  {
    id: 'clinical',
    name: 'Clinical',
    headCount: 32,
    departmentHead: 'Dr. James Chen',
    avgSickDays: 6.8,
    avgLateness: 12,
    turnoverRate: 15,
    engagementScore: 68,
    assessmentCompletion: 85,
    riskLevel: 'Medium',
    topIssues: ['Burnout from patient load', 'Documentation overhead', 'Emotional fatigue'],
    monthlyCost: 12200,
    cascadeScore: 2.8
  },
  {
    id: 'admin',
    name: 'Administrative',
    headCount: 28,
    departmentHead: 'Sarah Mitchell',
    avgSickDays: 5.4,
    avgLateness: 18,
    turnoverRate: 12,
    engagementScore: 71,
    assessmentCompletion: 92,
    riskLevel: 'Medium',
    topIssues: ['Monotony', 'Lack of growth', 'Under-recognition'],
    monthlyCost: 8400,
    cascadeScore: 1.9
  },
  {
    id: 'it',
    name: 'IT & Technology',
    headCount: 15,
    departmentHead: 'Kevin Park',
    avgSickDays: 4.2,
    avgLateness: 8,
    turnoverRate: 20,
    engagementScore: 65,
    assessmentCompletion: 60,
    riskLevel: 'Medium',
    topIssues: ['Remote work isolation', 'After-hours incidents', 'Skill stagnation'],
    monthlyCost: 6800,
    cascadeScore: 1.5
  },
  {
    id: 'sales',
    name: 'Sales & Marketing',
    headCount: 20,
    departmentHead: 'Rachel Adams',
    avgSickDays: 3.8,
    avgLateness: 15,
    turnoverRate: 28,
    engagementScore: 58,
    assessmentCompletion: 55,
    riskLevel: 'High',
    topIssues: ['Target pressure', 'Commission disputes', 'Travel fatigue'],
    monthlyCost: 9200,
    cascadeScore: 2.2
  },
  {
    id: 'mgmt',
    name: 'Management',
    headCount: 10,
    departmentHead: 'David Brooks',
    avgSickDays: 3.1,
    avgLateness: 5,
    turnoverRate: 8,
    engagementScore: 78,
    assessmentCompletion: 45,
    riskLevel: 'Low',
    topIssues: ['Decision fatigue', 'Stakeholder pressure', 'Work-life boundaries'],
    monthlyCost: 4200,
    cascadeScore: 1.2
  },
];

export const DepartmentView = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'risk' | 'cost' | 'engagement' | 'sick'>('risk');

  const sortedDepts = [...DEPARTMENTS].sort((a, b) => {
    switch (sortBy) {
      case 'risk': {
        const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }
      case 'cost': return b.monthlyCost - a.monthlyCost;
      case 'engagement': return a.engagementScore - b.engagementScore;
      case 'sick': return b.avgSickDays - a.avgSickDays;
      default: return 0;
    }
  });

  const filteredDepts = sortedDepts.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.departmentHead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCost = DEPARTMENTS.reduce((acc, d) => acc + d.monthlyCost, 0);
  const totalEmployees = DEPARTMENTS.reduce((acc, d) => acc + d.headCount, 0);
  const avgEngagement = Math.round(DEPARTMENTS.reduce((acc, d) => acc + d.engagementScore, 0) / DEPARTMENTS.length);
  const highRiskDepts = DEPARTMENTS.filter(d => d.riskLevel === 'High' || d.riskLevel === 'Critical').length;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-purple-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hr/assessment')} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                Department Assessment View
              </h1>
              <p className="text-gray-500 mt-1">Per-department risk analysis for department heads and HR leadership</p>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Workforce</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{totalEmployees}</p>
            <p className="text-xs text-gray-400 mt-1">{DEPARTMENTS.length} departments</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Loss</p>
            <p className="text-3xl font-black text-red-600 mt-2">${(totalCost / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-400 mt-1">All departments combined</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Engagement</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">{avgEngagement}%</p>
            <p className="text-xs text-gray-400 mt-1">Company-wide</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">High Risk Depts</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{highRiskDepts}</p>
            <p className="text-xs text-gray-400 mt-1">Require immediate attention</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search department or head..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Sort:</span>
            {[
              { id: 'risk', label: 'Risk Level' },
              { id: 'cost', label: 'Cost Impact' },
              { id: 'engagement', label: 'Engagement' },
              { id: 'sick', label: 'Sick Days' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === s.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepts.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDept(dept)}
              className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                selectedDept?.id === dept.id ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100 hover:border-purple-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{dept.name}</h3>
                  <p className="text-xs text-gray-500">{dept.departmentHead} • {dept.headCount} staff</p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  dept.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                  dept.riskLevel === 'High' ? 'bg-amber-100 text-amber-700' :
                  dept.riskLevel === 'Medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {dept.riskLevel}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Sick Days</p>
                  <p className={`text-lg font-black ${dept.avgSickDays > 7 ? 'text-red-600' : dept.avgSickDays > 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                    {dept.avgSickDays}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Late (min/wk)</p>
                  <p className={`text-lg font-black ${dept.avgLateness > 20 ? 'text-red-600' : dept.avgLateness > 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                    {dept.avgLateness}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Engagement</p>
                  <p className={`text-lg font-black ${dept.engagementScore < 55 ? 'text-red-600' : dept.engagementScore < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {dept.engagementScore}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Cost</p>
                  <p className="text-lg font-black text-gray-900">${(dept.monthlyCost / 1000).toFixed(1)}K</p>
                </div>
              </div>

              {/* Top Issues */}
              <div className="flex flex-wrap gap-1">
                {dept.topIssues.map(issue => (
                  <span key={issue} className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    {issue}
                  </span>
                ))}
              </div>

              {/* Assessment Progress */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Assessment Completion</span>
                  <span className="text-xs font-bold text-gray-600">{dept.assessmentCompletion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dept.assessmentCompletion >= 80 ? 'bg-emerald-500' :
                      dept.assessmentCompletion >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.assessmentCompletion}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Department Detail */}
        {selectedDept && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{selectedDept.name} — Detailed Analysis</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/hr/questionnaire/absenteeism`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all"
                >
                  Deploy Assessment →
                </button>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cascade Effect */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-purple-600" />
                  Cascade Score
                </h4>
                <p className="text-4xl font-black text-purple-700">{selectedDept.cascadeScore}x</p>
                <p className="text-xs text-purple-600 mt-2">
                  Each absence in {selectedDept.name} triggers {selectedDept.cascadeScore}x downstream effects
                </p>
              </div>

              {/* Turnover Risk */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  Annual Turnover
                </h4>
                <p className="text-4xl font-black text-red-700">{selectedDept.turnoverRate}%</p>
                <p className="text-xs text-red-600 mt-2">
                  ≈ {Math.round(selectedDept.headCount * selectedDept.turnoverRate / 100)} employees leaving per year
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200">
                    Send Assessment to {selectedDept.departmentHead}
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200">
                    Schedule Department Review
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200">
                    Generate Cost Report PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
