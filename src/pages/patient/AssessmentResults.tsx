import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Clock,
  ActivitySquare,
  ScanLine,
  Camera,
  HeartPulse
} from 'lucide-react';

const typeConfig: Record<string, { icon: any; color: string; gradient: string; label: string }> = {
  msk: { icon: ActivitySquare, color: 'indigo', gradient: 'from-indigo-600 to-indigo-700', label: 'MSK Risk Screen' },
  mot: { icon: ScanLine, color: 'emerald', gradient: 'from-emerald-600 to-teal-600', label: '3D Motion Assessment' },
  post: { icon: Camera, color: 'violet', gradient: 'from-violet-600 to-purple-600', label: 'Posture Analysis' }
};

const mockResults = {
  msk: {
    type: 'msk',
    date: new Date().toISOString(),
    score: 72,
    riskLevel: 'High',
    summary: 'Elevated MSK risk detected. Lower back is the primary concern with a pain level of 8/10. Work-related factors including prolonged standing and repetitive lifting are significant contributors. Limited range of motion noted in the lower back and shoulders.',
    recommendations: [
      'Ergonomic workstation assessment',
      'Physical therapy referral',
      'Lower back strengthening program',
      'Anti-inflammatory protocol review'
    ],
    followUp: 'In 2 weeks',
    sharedWithHR: false
  },
  mot: {
    type: 'mot',
    date: new Date().toISOString(),
    score: 63,
    asymmetryIndex: 22,
    summary: 'Moderate biomechanical inefficiencies detected. Squat test showed knee valgus with forward lean compensation. Overhead reach demonstrated good bilateral symmetry. Gait analysis revealed mild antalgic patterns. Hip and ankle mobility deficits identified.',
    recommendations: [
      'Hip strengthening program',
      'Gait correction exercises',
      'Ankle mobility work',
      'Squat form re-training'
    ],
    followUp: 'In 4 weeks',
    sharedWithHR: false
  },
  post: {
    type: 'post',
    date: new Date().toISOString(),
    score: 72,
    summary: 'Mild forward head posture (8 degrees) and shoulder height discrepancy (1.5cm) detected. Spinal alignment shows minor deviation. These patterns are consistent with prolonged sitting. Correctable with targeted exercises.',
    recommendations: [
      'Chin tucks (2 min daily)',
      'Wall angels (3 min daily)',
      'Cat-cow stretch (5 min daily)',
      'Hip flexor stretch (3 min daily)'
    ],
    followUp: 'In 6 weeks',
    sharedWithHR: false
  }
};

export const AssessmentResults = () => {
  const { id } = useParams();
  const typeKey = id?.split('-')[0] || 'msk';
  const config = typeConfig[typeKey] || typeConfig.msk;
  const result = mockResults[typeKey as keyof typeof mockResults] || mockResults.msk;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/assessment"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Assessment Results</h1>
              <p className="text-xs text-slate-500">{config.label}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
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
                <span className="text-6xl font-black">{result.score}</span>
                <span className="text-2xl text-indigo-200">/100</span>
              </div>
              <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-bold ${
                result.score >= 70 ? 'bg-emerald-500/30 text-emerald-200' :
                result.score >= 50 ? 'bg-amber-500/30 text-amber-200' : 'bg-red-500/30 text-red-200'
              }`}>
                {result.score >= 70 ? <CheckCircle2 className="w-4 h-4 mr-1" /> :
                 result.score >= 50 ? <AlertTriangle className="w-4 h-4 mr-1" /> :
                 <AlertTriangle className="w-4 h-4 mr-1" />}
                {result.score >= 70 ? 'Good' : result.score >= 50 ? 'Needs Attention' : 'High Risk'}
              </span>
            </div>
            <div className="text-right">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur">
                <p className="text-xs text-indigo-200">Asymmetry Index</p>
                {result.asymmetryIndex && (
                  <p className="text-2xl font-black">{result.asymmetryIndex}%</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date & Status */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          Completed {new Date(result.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium">CONFIDENTIAL</span>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">AI Clinical Summary</h2>
          </div>
          <p className="text-slate-700 leading-relaxed">{result.summary}</p>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Personalized Recommendations</h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up & Share */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-900">Recommended Follow-up</span>
            </div>
            <p className="text-sm text-amber-700">{result.followUp}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-700">Wellness Programs</span>
            </div>
            <p className="text-sm text-slate-600">Based on your results, you may benefit from our Back Pain Management Program.</p>
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
