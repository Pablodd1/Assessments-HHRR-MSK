import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

const INTERVENTIONS = [
  {
    id: 1,
    employee: 'Robert Wilson',
    type: 'MSK Management',
    program: 'Back Pain Management Program',
    status: 'Active',
    startDate: '2026-04-20',
    progress: 35,
    nextSession: 'Tomorrow, 2:00 PM',
    aiRecommended: true
  },
  {
    id: 2,
    employee: 'James Thompson',
    type: 'Acute Care',
    program: 'Urgent Medical Evaluation',
    status: 'Pending',
    startDate: '2026-04-22',
    progress: 0,
    nextSession: 'Scheduled for Apr 24',
    aiRecommended: true
  },
  {
    id: 3,
    employee: 'Michael Chang',
    type: 'Mobility',
    program: 'Gait Correction Program',
    status: 'Active',
    startDate: '2026-04-10',
    progress: 60,
    nextSession: 'Today, 4:00 PM',
    aiRecommended: false
  },
  {
    id: 4,
    employee: 'Sarah Jenkins',
    type: 'Wellness',
    program: 'Leadership Development',
    status: 'Completed',
    startDate: '2026-03-01',
    progress: 100,
    nextSession: 'Completed',
    aiRecommended: false
  }
];

export const Interventions = () => {
  const { employees } = useDemo();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? INTERVENTIONS : INTERVENTIONS.filter(i => i.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Interventions</h1>
              <p className="text-xs text-slate-500">AI-Recommended Wellness Programs</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Intervention
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Programs', value: INTERVENTIONS.filter(i => i.status === 'Active').length, color: 'emerald' },
            { label: 'Pending', value: INTERVENTIONS.filter(i => i.status === 'Pending').length, color: 'amber' },
            { label: 'Completed', value: INTERVENTIONS.filter(i => i.status === 'Completed').length, color: 'indigo' },
            { label: 'AI Recommended', value: INTERVENTIONS.filter(i => i.aiRecommended).length, color: 'violet' }
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'Active', 'Pending', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Intervention Cards */}
        <div className="space-y-4">
          {filtered.map((intervention, i) => (
            <motion.div
              key={intervention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    intervention.status === 'Active' ? 'bg-emerald-50' :
                    intervention.status === 'Pending' ? 'bg-amber-50' : 'bg-indigo-50'
                  }`}>
                    {intervention.status === 'Active' && <TrendingUp className="w-5 h-5 text-emerald-600" />}
                    {intervention.status === 'Pending' && <Clock className="w-5 h-5 text-amber-600" />}
                    {intervention.status === 'Completed' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{intervention.employee}</h3>
                      {intervention.aiRecommended && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-black rounded-full">
                          AI RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-indigo-600 font-medium">{intervention.program}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Started: {new Date(intervention.startDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {intervention.nextSession}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    intervention.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    intervention.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {intervention.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {intervention.status !== 'Pending' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-bold">{intervention.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        intervention.status === 'Completed' ? 'bg-indigo-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${intervention.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
