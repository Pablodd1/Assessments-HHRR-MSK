import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  X,
  TrendingUp,
  Users,
  Save,
  Calendar,
  Target,
  MessageSquare
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';
import type { Intervention, InterventionStatus, InterventionType, NewInterventionPayload } from '../../types/clinical';

const INTERVENTION_TYPES: InterventionType[] = [
  'MSK Management',
  'Acute Care',
  'Mobility',
  'Wellness',
  'Mental Health',
  'Ergonomic'
];

const INITIAL_INTERVENTIONS: Intervention[] = [
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
    outcomes: [
      { date: '2026-04-20', type: 'milestone', description: 'Initial assessment completed' },
      { date: '2026-04-22', type: 'note', description: 'Patient reports 10% pain reduction' }
    ]
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
    outcomes: [
      { date: '2026-04-10', type: 'milestone', description: 'Initial gait analysis completed' },
      { date: '2026-04-17', type: 'note', description: 'Showing improvement in left knee alignment' }
    ]
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
    outcomes: [
      { date: '2026-03-01', type: 'milestone', description: 'Program started' },
      { date: '2026-03-15', type: 'note', description: 'Completed leadership module 1' },
      { date: '2026-04-01', type: 'completion', description: 'All modules completed successfully' }
    ]
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
    outcomes: [
      { date: '2026-04-15', type: 'milestone', description: 'Initial stress assessment completed' }
    ]
  },
  {
    id: 'int-6',
    employeeId: 'emp-3',
    employeeName: 'Michael Chang',
    department: 'Food & Beverage',
    type: 'Mental Health',
    program: 'Employee Assistance Program',
    status: 'Pending',
    startDate: '2026-04-25',
    progress: 0,
    aiRecommended: true,
    outcomes: []
  }
];

type StatusFilter = 'all' | InterventionStatus;

const getStatusColor = (status: InterventionStatus): string => {
  switch (status) {
    case 'In Progress': return 'bg-emerald-100 text-emerald-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Completed': return 'bg-indigo-100 text-indigo-700';
    case 'Cancelled': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getStatusBgColor = (status: InterventionStatus): string => {
  switch (status) {
    case 'In Progress': return 'bg-emerald-50';
    case 'Pending': return 'bg-amber-50';
    case 'Completed': return 'bg-indigo-50';
    default: return 'bg-slate-50';
  }
};

const getStatusIcon = (status: InterventionStatus) => {
  switch (status) {
    case 'In Progress': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
    case 'Pending': return <Clock className="w-5 h-5 text-amber-600" />;
    case 'Completed': return <CheckCircle2 className="w-5 h-5 text-indigo-600" />;
    default: return <AlertTriangle className="w-5 h-5 text-slate-600" />;
  }
};

interface NewInterventionFormData {
  employeeId: string;
  type: InterventionType;
  program: string;
  targetEndDate: string;
  notes: string;
}

const initialFormData: NewInterventionFormData = {
  employeeId: '',
  type: 'MSK Management',
  program: '',
  targetEndDate: '',
  notes: ''
};

export const Interventions = () => {
  const { employees } = useDemo();
  const [interventions, setInterventions] = useState<Intervention[]>(INITIAL_INTERVENTIONS);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<NewInterventionFormData>(initialFormData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOutcome, setNewOutcome] = useState<{ interventionId: string; text: string } | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return interventions;
    return interventions.filter(i => i.status === filter);
  }, [interventions, filter]);

  // KPIs
  const activeCount = interventions.filter(i => i.status === 'In Progress').length;
  const pendingCount = interventions.filter(i => i.status === 'Pending').length;
  const completedCount = interventions.filter(i => i.status === 'Completed').length;
  const aiRecommendedCount = interventions.filter(i => i.aiRecommended).length;

  const handleCreateIntervention = () => {
    if (!formData.employeeId || !formData.program) return;

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const newIntervention: Intervention = {
      id: `int-${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      department: employee.department,
      type: formData.type,
      program: formData.program,
      status: 'Pending',
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: formData.targetEndDate || undefined,
      progress: 0,
      aiRecommended: false,
      outcomes: [],
      notes: formData.notes || undefined
    };

    setInterventions(prev => [newIntervention, ...prev]);
    setFormData(initialFormData);
    setShowCreateModal(false);
  };

  const handleStatusChange = (id: string, newStatus: InterventionStatus) => {
    setInterventions(prev => prev.map(i =>
      i.id === id ? { ...i, status: newStatus, progress: newStatus === 'Completed' ? 100 : i.progress } : i
    ));
  };

  const handleProgressUpdate = (id: string, progress: number) => {
    setInterventions(prev => prev.map(i =>
      i.id === id ? { ...i, progress: Math.min(100, Math.max(0, progress)) } : i
    ));
  };

  const handleAddOutcome = (interventionId: string) => {
    if (!newOutcome?.text.trim()) return;

    setInterventions(prev => prev.map(i => {
      if (i.id === interventionId) {
        return {
          ...i,
          outcomes: [
            ...i.outcomes,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'note' as const,
              description: newOutcome.text.trim()
            }
          ]
        };
      }
      return i;
    }));
    setNewOutcome(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Employee', 'Department', 'Type', 'Program', 'Status', 'Progress', 'Start Date', 'AI Recommended'];
    const rows = interventions.map(i => [
      i.id,
      i.employeeName,
      i.department,
      i.type,
      i.program,
      i.status,
      `${i.progress}%`,
      i.startDate,
      i.aiRecommended ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interventions_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Intervention
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Programs', value: activeCount, color: 'emerald' },
            { label: 'Pending', value: pendingCount, color: 'amber' },
            { label: 'Completed', value: completedCount, color: 'indigo' },
            { label: 'AI Recommended', value: aiRecommendedCount, color: 'violet' }
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
          {(['all', 'Pending', 'In Progress', 'Completed'] as StatusFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Intervention Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((intervention, i) => (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getStatusBgColor(intervention.status)}`}>
                      {getStatusIcon(intervention.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{intervention.employeeName}</h3>
                        {intervention.aiRecommended && (
                          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-black rounded-full">
                            AI RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-indigo-600 font-medium">{intervention.program}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{intervention.department}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started: {new Date(intervention.startDate).toLocaleDateString()}
                        </span>
                        {intervention.nextSession && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {intervention.nextSession}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(intervention.status)}`}>
                      {intervention.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setExpandedId(expandedId === intervention.id ? null : intervention.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {expandedId === intervention.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {intervention.status !== 'Pending' && intervention.status !== 'Cancelled' && (
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

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === intervention.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        {/* Status Update */}
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-500 w-20">Status:</span>
                          <select
                            value={intervention.status}
                            onChange={(e) => handleStatusChange(intervention.id, e.target.value as InterventionStatus)}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Progress Update */}
                        {intervention.status !== 'Completed' && intervention.status !== 'Cancelled' && (
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500 w-20">Progress:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={intervention.progress}
                              onChange={(e) => handleProgressUpdate(intervention.id, parseInt(e.target.value))}
                              className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <span className="text-xs font-bold text-slate-600 w-12">{intervention.progress}%</span>
                          </div>
                        )}

                        {/* Outcomes Timeline */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500">Outcomes & Notes</span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {intervention.outcomes.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No outcomes recorded yet</p>
                            ) : (
                              intervention.outcomes.map((outcome, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <div className={`p-1 rounded ${
                                    outcome.type === 'completion' ? 'bg-indigo-100 text-indigo-600' :
                                    outcome.type === 'milestone' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {outcome.type === 'completion' && <CheckCircle2 className="w-3 h-3" />}
                                    {outcome.type === 'milestone' && <Target className="w-3 h-3" />}
                                    {outcome.type === 'note' && <MessageSquare className="w-3 h-3" />}
                                  </div>
                                  <div>
                                    <p className="text-slate-700">{outcome.description}</p>
                                    <p className="text-slate-400">{new Date(outcome.date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Outcome */}
                          {intervention.status !== 'Completed' && intervention.status !== 'Cancelled' && (
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a note or outcome..."
                                value={newOutcome?.interventionId === intervention.id ? newOutcome.text : ''}
                                onChange={(e) => setNewOutcome({ interventionId: intervention.id, text: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newOutcome?.text.trim()) {
                                    handleAddOutcome(intervention.id);
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                onClick={() => handleAddOutcome(intervention.id)}
                                disabled={!newOutcome?.text.trim()}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {intervention.notes && (
                          <div>
                            <span className="text-xs font-bold text-slate-500">Notes:</span>
                            <p className="text-xs text-slate-600 mt-1">{intervention.notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Intervention Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Create New Intervention</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Employee Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Employee *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select an employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intervention Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as InterventionType }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {INTERVENTION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Program Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                    placeholder="e.g., Back Pain Management Program"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Target End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={formData.targetEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetEndDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIntervention}
                  disabled={!formData.employeeId || !formData.program}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
