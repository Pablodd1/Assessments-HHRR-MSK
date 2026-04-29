import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Clock,
  ActivitySquare,
  ScanLine,
  Camera,
  HeartPulse,
  X
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

// ─────────────────────────────────────────
// Type config for assessment types
// ─────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  icon: React.ElementType;
  gradient: string;
  label: string;
  scoreField: string;
}> = {
  msk:  { icon: ActivitySquare, gradient: 'from-indigo-600 to-indigo-700', label: 'MSK Risk Screen',     scoreField: 'mskScore'     },
  mot:  { icon: ScanLine,       gradient: 'from-emerald-600 to-teal-600',   label: '3D Motion Assessment', scoreField: 'motionScore'  },
  post: { icon: Camera,         gradient: 'from-violet-600 to-purple-600',  label: 'Posture Analysis',    scoreField: 'postureScore' },
};

const STATUS_COLOR = (score: number) =>
  score >= 70 ? { bg: 'bg-emerald-500/30',   text: 'text-emerald-200', label: 'Good' } :
  score >= 50 ? { bg: 'bg-amber-500/30',    text: 'text-amber-200',  label: 'Needs Attention' } :
               { bg: 'bg-red-500/30',       text: 'text-red-200',    label: 'High Risk' };

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const AssessmentResults = () => {
  const { id } = useParams();
  const { employees } = useDemo();

  // Find which employee has this assessment result
  // Look through all employees' clinical assessments
  let foundAssessment: { employeeId: string; type: string; mskData?: any; motionData?: any; postureData?: any; clinicalNotes?: string; aiSummary?: string; recommendedPrograms?: string[]; assessmentDate?: string } | null = null;
  let foundEmployee: { name: string } | null = null;

  for (const emp of employees) {
    if (emp.clinicalAssessment) {
      const ca = emp.clinicalAssessment;
      const matchesMsk  = ca.mskData?.id === id || (id?.startsWith('msk')  && ca.type === 'MSK_SCREEN');
      const matchesMot  = ca.motionData?.id === id || (id?.startsWith('mot') && ca.type === '3D_MOTION');
      const matchesPost = ca.postureData?.id === id || (id?.startsWith('post') && ca.type === 'POSTURE');
      if (matchesMsk || matchesMot || matchesPost) {
        foundAssessment = ca;
        foundEmployee = emp;
        break;
      }
    }
  }

  // Determine type from id prefix
  const typeKey = (id?.split('-')[0] || 'msk') as keyof typeof TYPE_CONFIG;
  const config  = TYPE_CONFIG[typeKey] || TYPE_CONFIG.msk;
  const Icon    = config.icon;

  // Derive display data from found assessment
  const displayData = useMemo(() => {
    if (!foundAssessment) {
      // Show placeholder for unknown/missing results
      return {
        score: 72,
        asymmetryIndex: null as number | null,
        summary: 'Assessment result could not be loaded from the system.',
        recommendations: ['Contact HR if you need access to this report.'],
        followUp: 'N/A',
        date: new Date().toISOString(),
        status: 'unknown' as string
      };
    }

    const ca = foundAssessment;
    if (ca.mskData) {
      return {
        score: ca.mskData.riskScore ?? 72,
        asymmetryIndex: null,
        summary: ca.aiSummary || ca.clinicalNotes || 'MSK assessment completed.',
        recommendations: ca.mskData.recommendations || [],
        followUp: 'In 2 weeks',
        date: ca.assessmentDate || new Date().toISOString(),
        status: ca.status || 'completed'
      };
    }
    if (ca.motionData) {
      return {
        score: ca.motionData.overallMobilityScore ?? 65,
        asymmetryIndex: ca.motionData.asymmetryIndex ?? null,
        summary: ca.aiSummary || ca.clinicalNotes || 'Motion assessment completed.',
        recommendations: ca.motionData.riskFlags?.length
          ? ca.motionData.riskFlags.map((f: string) => `Address: ${f}`)
          : ['Continue mobility maintenance program.'],
        followUp: 'In 4 weeks',
        date: ca.assessmentDate || new Date().toISOString(),
        status: ca.status || 'completed'
      };
    }
    if (ca.postureData) {
      return {
        score: ca.postureData.score ?? 72,
        asymmetryIndex: null,
        summary: ca.aiSummary || ca.clinicalNotes || 'Posture analysis completed.',
        recommendations: ca.postureData.recommendations || [],
        followUp: 'In 6 weeks',
        date: ca.assessmentDate || new Date().toISOString(),
        status: ca.status || 'completed'
      };
    }
    return {
      score: 72,
      asymmetryIndex: null,
      summary: ca.aiSummary || ca.clinicalNotes || 'Assessment completed.',
      recommendations: ca.recommendedPrograms || [],
      followUp: 'N/A',
      date: ca.assessmentDate || new Date().toISOString(),
      status: ca.status || 'completed'
    };
  }, [foundAssessment]);

  const statusColors = STATUS_COLOR(displayData.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/assessment" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Assessment Results</h1>
              <p className="text-xs text-slate-500">
                {config.label}
                {foundEmployee && <span className="ml-1">— {foundEmployee.name}</span>}
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-8 text-white shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">Your {config.label} Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black">{displayData.score}</span>
                <span className="text-2xl text-indigo-200">/100</span>
              </div>
              <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-bold ${statusColors.bg} ${statusColors.text}`}>
                {displayData.score >= 70 ? <CheckCircle2 className="w-4 h-4 mr-1" /> :
                 displayData.score >= 50 ? <AlertTriangle className="w-4 h-4 mr-1" /> :
                 <AlertTriangle className="w-4 h-4 mr-1" />}
                {statusColors.label}
              </span>
            </div>
            {displayData.asymmetryIndex !== null && (
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur text-right">
                <p className="text-xs text-indigo-200">Asymmetry Index</p>
                <p className="text-2xl font-black">{displayData.asymmetryIndex}%</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Date & Status */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          Completed {new Date(displayData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium">
            {displayData.status === 'completed' ? 'CONFIDENTIAL' : displayData.status.toUpperCase()}
          </span>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">AI Clinical Summary</h2>
          </div>
          <p className="text-slate-700 leading-relaxed">{displayData.summary}</p>
        </div>

        {/* Recommendations */}
        {displayData.recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Personalized Recommendations</h2>
            <div className="space-y-3">
              {displayData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up & Wellness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-900">Recommended Follow-up</span>
            </div>
            <p className="text-sm text-amber-700">{displayData.followUp}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-700">Wellness Programs</span>
            </div>
            <p className="text-sm text-slate-600">
              Based on your results, you may benefit from our Back Pain Management Program.
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-500">
          <p>
            <strong>Privacy:</strong> Your assessment results are confidential and protected under GDPR.
            Results are only shared with HR with your explicit consent.
            You can request deletion of your data at any time.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to="/assessment"
            className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold text-center hover:bg-slate-50 transition-colors"
          >
            New Assessment
          </Link>
          <Link
            to="/history"
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-center hover:bg-indigo-700 transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  );
};
