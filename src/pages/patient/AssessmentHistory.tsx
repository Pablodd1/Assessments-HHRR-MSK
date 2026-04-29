import React from 'react';
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
  TrendingDown
} from 'lucide-react';

const ASSESSMENT_TYPES = [
  {
    id: 'msk-1745800000000',
    type: 'MSK Risk Screen',
    icon: ActivitySquare,
    color: 'indigo',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    score: 72,
    riskLevel: 'High',
    trend: 'up'
  },
  {
    id: 'msk-1745200000000',
    type: 'MSK Risk Screen',
    icon: ActivitySquare,
    color: 'indigo',
    date: new Date(Date.now() - 86400000 * 30).toISOString(),
    score: 65,
    riskLevel: 'Moderate',
    trend: null
  },
  {
    id: 'mot-1745400000000',
    type: '3D Motion Assessment',
    icon: ScanLine,
    color: 'emerald',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    score: 63,
    riskLevel: 'Moderate',
    trend: null
  },
  {
    id: 'post-1745600000000',
    type: 'Posture Analysis',
    icon: Camera,
    color: 'violet',
    date: new Date(Date.now() - 86400000 * 14).toISOString(),
    score: 78,
    riskLevel: 'Low',
    trend: 'up'
  }
];

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' }
};

export const AssessmentHistory = () => {
  const assessments = ASSESSMENT_TYPES;

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
            <p className="text-xs text-slate-500">{assessments.length} assessments</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {assessments.map((assessment, index) => {
          const colors = colorMap[assessment.color];
          const Icon = assessment.icon;
          return (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/results/${assessment.id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{assessment.type}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(assessment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900">{assessment.score}</span>
                        {assessment.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        {assessment.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      </div>
                      <span className={`text-xs font-bold ${
                        assessment.riskLevel === 'Low' ? 'text-emerald-600' :
                        assessment.riskLevel === 'Moderate' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {assessment.riskLevel}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-3xl font-black text-indigo-600">4</p>
            <p className="text-xs text-slate-500 mt-1">Total Assessments</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-3xl font-black text-emerald-600">72</p>
            <p className="text-xs text-slate-500 mt-1">Avg Score</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-3xl font-black text-amber-600">2</p>
            <p className="text-xs text-slate-500 mt-1">Active Programs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
