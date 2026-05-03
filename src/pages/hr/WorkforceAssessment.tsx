import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  DollarSign,
  RefreshCcw,
  Upload,
  Users,
  Building2,
  TrendingDown,
  Brain,
  Apple,
  Clock,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Zap,
  Heart,
  Shield,
  Target
} from 'lucide-react';

const ASSESSMENT_CATEGORIES = [
  {
    id: 'absenteeism',
    title: 'Absenteeism & Sick Day Analysis',
    description: 'Track sick day patterns, identify root causes, and calculate coverage costs',
    icon: Clock,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    metrics: ['Sick day frequency', 'Pattern detection', 'Coverage impact', 'Return satisfaction'],
    questionCount: 18
  },
  {
    id: 'lateness',
    title: 'Lateness & Punctuality',
    description: 'Understand why employees arrive late and how it impacts workflow',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    metrics: ['Avg minutes late', 'Root causes', 'Shift correlation', 'Team impact'],
    questionCount: 14
  },
  {
    id: 'vicious-cycle',
    title: 'The Vicious Cycle Mapper',
    description: 'Map how one absence creates cascading burnout across the team',
    icon: RefreshCcw,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    metrics: ['Cascade effect', 'Double shift frequency', 'Fatigue scoring', 'Breaking points'],
    questionCount: 12
  },
  {
    id: 'productivity',
    title: 'Productivity & Engagement',
    description: 'Assess energy levels, focus, task completion, and collaboration effectiveness',
    icon: Zap,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    metrics: ['Task completion', 'Energy levels', 'Focus score', 'Collaboration'],
    questionCount: 20
  },
  {
    id: 'incentives',
    title: 'Incentive & Motivation Profiling',
    description: 'Discover what truly motivates each employee — not one-size-fits-all',
    icon: Target,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    metrics: ['Recognition type', 'Growth aspirations', 'Work-life balance', 'Learning needs'],
    questionCount: 16
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Supplementation',
    description: 'Assess energy patterns, sleep quality, hydration, and cognitive performance',
    icon: Apple,
    color: 'from-green-500 to-lime-600',
    bgColor: 'bg-green-50',
    metrics: ['Energy patterns', 'Sleep quality', 'Hydration', 'Cognitive performance'],
    questionCount: 22
  },
  {
    id: 'environment',
    title: 'Workplace Environment',
    description: 'Evaluate workstation comfort, noise, temperature, and break quality',
    icon: Building2,
    color: 'from-slate-500 to-gray-600',
    bgColor: 'bg-slate-50',
    metrics: ['Comfort rating', 'Distraction level', 'Break quality', 'Physical activity'],
    questionCount: 15
  },
  {
    id: 'mental-health',
    title: 'Mental Health & Stress',
    description: 'Screen for burnout indicators, stress levels, and coping mechanisms',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    metrics: ['Stress scale', 'Burnout indicators', 'Work-life boundaries', 'Social support'],
    questionCount: 20
  }
];

export const WorkforceAssessment = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deployMode, setDeployMode] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = ['All Departments', 'Operations', 'Clinical', 'Administrative', 'Management', 'IT', 'Sales'];

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <ClipboardList className="w-7 h-7 text-indigo-600" />
              </div>
              Workforce Assessment Hub
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Deploy structured questionnaires to identify root causes of absenteeism, lateness, low productivity, and burnout. 
              Quantify the cost to your organization and break the vicious cycle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/hr/cost-calculator')}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
              Cost Calculator
            </button>
            <button
              onClick={() => navigate('/hr/data-import')}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4 mr-2 text-blue-600" />
              Import Data
            </button>
            <button
              onClick={() => setDeployMode(!deployMode)}
              className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
                deployMode 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              {deployMode ? 'Cancel Deploy' : 'Deploy to Team'}
            </button>
          </div>
        </div>

        {/* Deploy Mode Panel */}
        <AnimatePresence>
          {deployMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Deploy Assessment to Department
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2 block">Target Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 outline-none"
                    >
                      {departments.map(d => (
                        <option key={d} value={d.toLowerCase()} className="text-gray-900">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2 block">Assessment Type</label>
                    <select className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/30 outline-none">
                      <option value="all" className="text-gray-900">Full Assessment Battery</option>
                      {ASSESSMENT_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id} className="text-gray-900">{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2 block">Mode</label>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2.5 bg-white/20 border border-white/30 rounded-lg text-sm font-bold hover:bg-white/30 transition-all">
                        Anonymous
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm font-bold hover:bg-white/20 transition-all opacity-60">
                        Identified
                      </button>
                    </div>
                  </div>
                </div>
                <button className="mt-4 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg">
                  Deploy Assessment Now →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Critical</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">$47.2K</p>
            <p className="text-xs text-gray-500 mt-1">Monthly absenteeism cost</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Warning</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">23 min</p>
            <p className="text-xs text-gray-500 mt-1">Avg weekly lateness</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <RefreshCcw className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Cycle</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">3.2x</p>
            <p className="text-xs text-gray-500 mt-1">Cascade multiplier</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Trend</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">68%</p>
            <p className="text-xs text-gray-500 mt-1">Assessment completion</p>
          </div>
        </div>

        {/* Assessment Categories Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Assessment Questionnaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ASSESSMENT_CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/hr/questionnaire/${category.id}`)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{category.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{category.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {category.metrics.map(m => (
                      <span key={m} className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400">{category.questionCount} questions</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Results Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Assessment Results</h2>
            <p className="text-sm text-gray-500 mt-1">Latest completed assessments across all departments</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { dept: 'Operations', type: 'Absenteeism', score: 72, risk: 'High', date: '2 days ago', respondents: 12 },
              { dept: 'Clinical', type: 'Productivity', score: 58, risk: 'Medium', date: '5 days ago', respondents: 8 },
              { dept: 'Administrative', type: 'Mental Health', score: 45, risk: 'Medium', date: '1 week ago', respondents: 15 },
              { dept: 'IT', type: 'Nutrition', score: 34, risk: 'Low', date: '2 weeks ago', respondents: 6 },
            ].map((result, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${
                    result.risk === 'High' ? 'bg-red-500' : result.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{result.dept} — {result.type}</p>
                    <p className="text-xs text-gray-500">{result.respondents} respondents • {result.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{result.score}%</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      result.risk === 'High' ? 'text-red-600' : result.risk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{result.risk} Risk</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
