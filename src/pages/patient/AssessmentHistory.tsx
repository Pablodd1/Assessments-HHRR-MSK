import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  ChevronRight,
  ActivitySquare,
  ScanLine,
  Camera,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  FileText
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface HistoryItem {
  id: string;
  type: string;
  typeLabel: string;
  icon: React.ElementType;
  color: string;
  colorClasses: { bg: string; border: string; icon: string };
  date: string;
  score: number;
  riskLevel: string;
  trend: 'up' | 'down' | null;
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const TYPE_META: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  colorClasses: { bg: string; border: string; icon: string };
}> = {
  MSK_SCREEN:  { label: 'MSK Risk Screen',       icon: ActivitySquare, color: 'indigo',  colorClasses: { bg: 'bg-indigo-50',  border: 'border-indigo-200', icon: 'text-indigo-600' } },
  '3D_MOTION': { label: '3D Motion Assessment',  icon: ScanLine,       color: 'emerald', colorClasses: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' } },
  POSTURE:     { label: 'Posture Analysis',      icon: Camera,         color: 'violet',  colorClasses: { bg: 'bg-violet-50',  border: 'border-violet-200', icon: 'text-violet-600' } },
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const AssessmentHistory = () => {
  const { currentUser, employees } = useDemo();

  // Collect all assessments for current user
  const historyItems = useMemo<HistoryItem[]>(() => {
    if (!currentUser?.employeeId) return [];

    const emp = employees.find(e => e.id === currentUser.employeeId);
    if (!emp?.clinicalAssessment) return [];

    const ca = emp.clinicalAssessment;
    const items: HistoryItem[] = [];

    if (ca.mskData) {
      const meta = TYPE_META.MSK_SCREEN;
      items.push({
        id: ca.mskData.id || `msk-${Date.now()}`,
        type: 'msk',
        typeLabel: meta.label,
        icon: meta.icon,
        color: meta.color,
        colorClasses: meta.colorClasses,
        date: ca.assessmentDate,
        score: ca.mskData.riskScore ?? 72,
        riskLevel: ca.mskData.riskLevel ?? 'Moderate',
        trend: null
      });
    }

    if (ca.motionData) {
      const meta = TYPE_META['3D_MOTION'];
      items.push({
        id: ca.motionData.id || `mot-${Date.now()}`,
        type: 'mot',
        typeLabel: meta.label,
        icon: meta.icon,
        color: meta.color,
        colorClasses: meta.colorClasses,
        date: ca.assessmentDate,
        score: ca.motionData.overallMobilityScore ?? 65,
        riskLevel: (ca.motionData.overallMobilityScore ?? 65) >= 70 ? 'Low' : (ca.motionData.overallMobilityScore ?? 65) >= 50 ? 'Moderate' : 'High',
        trend: null
      });
    }

    if (ca.postureData) {
      const meta = TYPE_META.POSTURE;
      items.push({
        id: ca.postureData.id || `post-${Date.now()}`,
        type: 'post',
        typeLabel: meta.label,
        icon: meta.icon,
        color: meta.color,
        colorClasses: meta.colorClasses,
        date: ca.assessmentDate,
        score: ca.postureData.score ?? 72,
        riskLevel: (ca.postureData.score ?? 72) >= 75 ? 'Low' : (ca.postureData.score ?? 72) >= 50 ? 'Moderate' : 'High',
        trend: null
      });
    }

    // Sort by date descending
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentUser, employees]);

  // Compute stats from real data
  const stats = useMemo(() => {
    if (historyItems.length === 0) return { total: 0, avgScore: 0, activePrograms: 0 };
    const total = historyItems.length;
    const avgScore = Math.round(historyItems.reduce((a, i) => a + i.score, 0) / total);
    const activePrograms = historyItems.filter(i => i.score < 50).length;
    return { total, avgScore, activePrograms };
  }, [historyItems]);

  const RISK_COLOR: Record<string, string> = {
    Low:      'text-emerald-600',
    Moderate: 'text-amber-600',
    High:     'text-red-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/assessment" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">My Assessment History</h1>
            <p className="text-xs text-slate-500">{historyItems.length} assessment{historyItems.length !== 1 ? 's' : ''} on record</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">

        {/* Empty state */}
        {historyItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FileText className="w-14 h-14 mx-auto mb-4 text-slate-300" />
            <h3 className="font-bold text-slate-700 mb-2">No Assessments Yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              Complete your first assessment to see your history here.
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
            >
              Start Assessment
            </Link>
          </motion.div>
        )}

        {/* Assessment cards */}
        {historyItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/results/${item.id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${item.colorClasses.bg}`}>
                      <Icon className={`w-6 h-6 ${item.colorClasses.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.typeLabel}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900">{item.score}</span>
                        {item.trend === 'up'   && <TrendingUp   className="w-4 h-4 text-emerald-500" />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500"   />}
                      </div>
                      <span className={`text-xs font-bold ${RISK_COLOR[item.riskLevel] || 'text-slate-500'}`}>
                        {item.riskLevel}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* Summary stats — only show if there is data */}
        {historyItems.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-3xl font-black text-indigo-600">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">Total Assessments</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-3xl font-black text-emerald-600">{stats.avgScore}</p>
              <p className="text-xs text-slate-500 mt-1">Average Score</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-3xl font-black text-amber-600">{stats.activePrograms}</p>
              <p className="text-xs text-slate-500 mt-1">Need Follow-up</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
