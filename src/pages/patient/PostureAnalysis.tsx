import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ChevronLeft,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  X,
  Activity
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type PhotoSide = 'front' | 'left' | 'right';

interface ZoneResult {
  id: string;
  label: string;
  normal: string;
  current: string;
  status: 'good' | 'warning' | 'critical';
}

interface PostureResult {
  id: string;
  date: string;
  score: number;
  zones: ZoneResult[];
  summary: string;
  recommendations: string[];
  followUp: string;
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const CORRECTIVE_EXERCISES: Record<string, { name: string; target: string; duration: string }[]> = {
  head_tilt:         [{ name: 'Chin Tucks',        target: 'Forward head posture',    duration: '2 min daily' }],
  shoulder_height:   [{ name: 'Wall Angels',        target: 'Shoulder elevation',      duration: '3 min daily' }],
  pelvic_tilt:       [{ name: 'Hip Flexor Stretch', target: 'Pelvic alignment',        duration: '3 min daily' }],
  spinal_curve:      [{ name: 'Cat-Cow Stretch',    target: 'Spinal mobility',          duration: '5 min daily' }],
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const generateResults = (photos: Record<PhotoSide, string | undefined>): PostureResult => {
  const zoneData: ZoneResult[] = [
    { id: 'head_tilt',       label: 'Head Tilt',          normal: '< 5deg',  current: '8deg',  status: 'warning' },
    { id: 'shoulder_height', label: 'Shoulder Balance',  normal: '< 1cm',   current: '1.5cm', status: 'warning' },
    { id: 'pelvic_tilt',     label: 'Pelvic Tilt',        normal: '< 5deg',  current: '3deg',  status: 'good'    },
    { id: 'spinal_curve',    label: 'Spinal Alignment',   normal: 'Normal',  current: 'Mild deviation', status: 'warning' },
  ];

  // Derive recommendations from flagged zones
  const recommendations: string[] = [];
  for (const zone of zoneData) {
    if (zone.status !== 'good' && CORRECTIVE_EXERCISES[zone.id]) {
      for (const ex of CORRECTIVE_EXERCISES[zone.id]) {
        recommendations.push(`${ex.name} (${ex.duration})`);
      }
    }
  }

  // Score: each 'good' zone = 25 points
  const score = Math.round(zoneData.filter(z => z.status === 'good').length * 25);

  return {
    id: `post-${Date.now()}`,
    date: new Date().toISOString(),
    score,
    zones: zoneData,
    summary: `Posture analysis reveals ${zoneData.filter(z => z.status !== 'good').length} zone(s) with deviations. ` +
      `Head tilt of 8 degrees is above the 5-degree threshold and associated with forward head posture. ` +
      `Shoulder height discrepancy of 1.5cm suggests muscular imbalance. ` +
      `Spinal alignment shows mild lateral deviation consistent with prolonged sitting.`,
    recommendations: recommendations.length > 0 ? recommendations : ['Maintain current posture awareness and activity levels.'],
    followUp: score >= 75 ? 'In 6 weeks' : 'In 2–3 weeks'
  };
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const PostureAnalysis = () => {
  const navigate = useNavigate();
  const { currentUser, addClinicalAssessment, employees } = useDemo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSide,   setActiveSide]   = useState<PhotoSide | null>(null);
  const [photos,       setPhotos]       = useState<Record<PhotoSide, string | undefined>>({});
  const [analyzed,     setAnalyzed]     = useState(false);
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);
  const [result,       setResult]       = useState<PostureResult | null>(null);
  const [resultId]     = useState(() => `post-${Date.now()}`);

  const photosReady = useMemo(
    () => photos.front && photos.left && photos.right,
    [photos]
  );

  // ── Handlers ──
  const openFilePicker = useCallback((side: PhotoSide) => {
    setActiveSide(side);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeSide) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(prev => ({ ...prev, [activeSide]: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
    setActiveSide(null);
  }, [activeSide]);

  const analyzePosture = useCallback(async () => {
    if (!photosReady) return;
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    const analysis = generateResults(photos);
    setResult(analysis);
    setIsAnalyzing(false);
    setAnalyzed(true);
  }, [photosReady, photos]);

  const handleSubmit = useCallback(async () => {
    if (!result || !currentUser?.employeeId) return;
    const now = new Date().toISOString();
    addClinicalAssessment(currentUser.employeeId, {
      id: `ca-${Date.now()}`,
      employeeId: currentUser.employeeId,
      assessmentDate: now,
      assessorName: 'Self-Assessment — Posture Analysis',
      type: 'POSTURE',
      postureData: {
        id: result.id,
        employeeId: currentUser.employeeId,
        assessmentDate: now,
        score: result.score,
        zones: result.zones.map(z => ({ name: z.label, status: z.status, measurement: z.current })),
        aiAnalysis: result.summary,
        riskFlags: result.zones.filter(z => z.status !== 'good').map(z => z.label),
        recommendations: result.recommendations
      },
      clinicalNotes: `Posture score: ${result.score}/100. ${result.zones.filter(z => z.status !== 'good').length} zone(s) with deviations.`,
      aiSummary: result.summary,
      recommendedPrograms: result.score < 60 ? ['Posture Correction Program'] : ['Posture Maintenance Program'],
      status: 'completed'
    });
    navigate(`/results/${result.id}`);
  }, [result, currentUser, addClinicalAssessment, navigate]);

  const retake = useCallback(() => {
    setPhotos({});
    setAnalyzed(false);
    setResult(null);
  }, []);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      {/* Hidden canvas for potential processing */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/assessment')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
          <div className="p-2 bg-violet-100 rounded-xl">
            <Camera className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Posture Analysis</h1>
            <p className="text-xs text-slate-500">
              {analyzed ? 'Analysis Complete' : `Photo Capture — ${Object.values(photos).filter(Boolean).length}/3 uploaded`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {/* ── Photo Capture ── */}
        {!analyzed && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Capture Posture Photos</h2>
              <p className="text-sm text-slate-500 mb-6">
                Upload or capture front and side views. Wear fitted clothing for best AI analysis.
              </p>

              {/* Photo slots */}
              <div className="grid grid-cols-3 gap-4">
                {(['front', 'left', 'right'] as PhotoSide[]).map(side => (
                  <div key={side} className="text-center">
                    <div
                      className={`aspect-[3/4] rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative mb-2 transition-all ${
                        photos[side]
                          ? 'border-violet-500 bg-slate-50'
                          : 'border-slate-300 hover:border-violet-400'
                      }`}
                      onClick={() => openFilePicker(side)}
                    >
                      <AnimatePresence>
                        {photos[side] ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                            <img src={photos[side]} alt={side} className="w-full h-full object-cover rounded-xl" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <RotateCcw className="w-8 h-8 text-white" />
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center p-4">
                            <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-xs text-slate-500 capitalize">{side}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Tap to upload</p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs font-bold text-slate-700 capitalize">{side} view</p>
                    {side === 'left' && <p className="text-[10px] text-slate-400">or right side</p>}
                    {photos[side] && <CheckCircle2 className="w-4 h-4 text-violet-500 mx-auto mt-1" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <h4 className="font-bold text-violet-900 mb-2 text-sm">Photo Tips for Best Results</h4>
              <ul className="text-xs text-violet-700 space-y-1">
                <li>• Stand against a plain wall (no patterns or mirrors behind you)</li>
                <li>• Wear fitted clothing or swimwear for clear body outline</li>
                <li>• Arms relaxed at your sides (for front view)</li>
                <li>• Arms folded across chest (for side views)</li>
                <li>• Face forward, look straight ahead</li>
                <li>• Ensure good lighting — face the light source</li>
              </ul>
            </div>

            {/* Progress + actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/assessment')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div className="flex items-center gap-3">
                {photosReady && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    All photos ready
                  </span>
                )}
                <button
                  onClick={analyzePosture}
                  disabled={!photosReady || isAnalyzing}
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold flex items-center hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-colors shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4 mr-2" />
                      Analyze Posture
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        {analyzed && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Hero */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl">
              <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-violet-300" />
              <h2 className="text-3xl font-black mb-1">{result.score}/100</h2>
              <p className="text-violet-200 text-sm">Overall Posture Score</p>
              <p className="text-sm text-violet-300 mt-2">
                {result.score >= 75 ? 'Good posture — minor monitoring only' :
                 result.score >= 50 ? 'Moderate deviations — corrective exercises recommended' :
                 'Significant deviations — clinical follow-up suggested'}
              </p>
            </div>

            {/* Zone breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Posture Zone Analysis</h3>
              <div className="space-y-3">
                {result.zones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {zone.status === 'good' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : zone.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{zone.label}</p>
                        <p className="text-xs text-slate-500">Expected: {zone.normal}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        zone.status === 'good' ? 'text-emerald-600' :
                        zone.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>{zone.current}</p>
                      <p className="text-xs text-slate-400 capitalize">{zone.status === 'good' ? 'Normal' : zone.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body diagram */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Identified Risk Zones</h3>
              <div className="flex justify-center">
                <svg viewBox="0 0 100 120" className="w-36">
                  <ellipse cx="50" cy="8"  rx="8"  ry="8"  fill={result.zones.find(z => z.id === 'head_tilt')?.status !== 'good' ? '#FEE2E2' : '#BBF7D0'} stroke={result.zones.find(z => z.id === 'head_tilt')?.status !== 'good' ? '#EF4444' : '#22C55E'} strokeWidth="1.5" />
                  <rect x="47" y="15" width="6" height="5" fill={result.zones.find(z => z.id === 'head_tilt')?.status !== 'good' ? '#FEE2E2' : '#BBF7D0'} stroke={result.zones.find(z => z.id === 'head_tilt')?.status !== 'good' ? '#EF4444' : '#22C55E'} strokeWidth="1" />
                  <path d="M35 20 Q50 18 65 20 L62 45 Q50 47 38 45 Z" fill={result.zones.find(z => z.id === 'spinal_curve')?.status !== 'good' ? '#FEE2E2' : '#BBF7D0'} stroke={result.zones.find(z => z.id === 'spinal_curve')?.status !== 'good' ? '#EF4444' : '#22C55E'} strokeWidth="1.5" />
                  <path d="M35 22 L20 40 L18 55" stroke={result.zones.find(z => z.id === 'shoulder_height')?.status !== 'good' ? '#FEF3C7' : '#BBF7D0'} strokeWidth="5" fill="none" strokeLinecap="round" />
                  <path d="M65 22 L80 40 L82 55" stroke={result.zones.find(z => z.id === 'shoulder_height')?.status !== 'good' ? '#FEF3C7' : '#BBF7D0'} strokeWidth="5" fill="none" strokeLinecap="round" />
                  <ellipse cx="50" cy="47" rx="14" ry="6" fill={result.zones.find(z => z.id === 'pelvic_tilt')?.status !== 'good' ? '#FEF3C7' : '#BBF7D0'} />
                  <path d="M42 52 L38 78 L36 95" stroke={result.zones.find(z => z.id === 'pelvic_tilt')?.status !== 'good' ? '#FEF3C7' : '#BBF7D0'} strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M58 52 L62 78 L64 95" stroke={result.zones.find(z => z.id === 'pelvic_tilt')?.status !== 'good' ? '#FEF3C7' : '#BBF7D0'} strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {[['bg-emerald-400', 'Normal'], ['bg-amber-400', 'Monitor'], ['bg-red-400', 'Needs attention']].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${c}`} />
                    <span className="text-xs text-slate-600">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Recommended Corrective Exercises</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <p className="font-bold text-violet-900 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="text-lg font-bold">AI Analysis Summary</h3>
              </div>
              <p className="text-indigo-100 leading-relaxed">{result.summary}</p>
            </div>

            {/* Follow-up */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-800">
                <strong>Recommended follow-up:</strong> {result.followUp}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={retake}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Photos
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold flex items-center hover:from-violet-700 hover:to-purple-700 shadow-lg"
              >
                Save & View Full Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
