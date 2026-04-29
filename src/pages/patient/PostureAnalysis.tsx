import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

const POSTURE_ZONES = [
  { id: 'head_tilt', label: 'Head Tilt', normal: '< 5deg', current: '8deg', status: 'warning' },
  { id: 'shoulder_height', label: 'Shoulder Balance', normal: '< 1cm diff', current: '1.5cm diff', status: 'warning' },
  { id: 'pelvic_tilt', label: 'Pelvic Tilt', normal: '< 5deg', current: '3deg', status: 'good' },
  { id: 'spinal_curve', label: 'Spinal Alignment', normal: 'Normal', current: 'Mild Deviation', status: 'warning' }
];

const CORRECTIVE_EXERCISES = [
  { name: 'Chin Tucks', target: 'Head forward posture', duration: '2 min daily' },
  { name: 'Wall Angels', target: 'Shoulder mobility', duration: '3 min daily' },
  { name: 'Cat-Cow Stretch', target: 'Spinal mobility', duration: '5 min daily' },
  { name: 'Hip Flexor Stretch', target: 'Pelvic alignment', duration: '3 min daily' }
];

export const PostureAnalysis = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<{ front?: string; left?: string; right?: string }>({});
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultId] = useState(() => `post-${Date.now()}`);

  const handlePhotoCapture = (side: 'front' | 'left' | 'right') => {
    fileInputRef.current?.click();
    // In a real app, would capture from camera. Here we simulate with a placeholder.
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(prev => ({ ...prev, [side]: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePosture = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsAnalyzing(false);
    setAnalyzed(true);
  };

  const overallScore = analyzed ? 72 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Camera className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Posture Analysis</h1>
            <p className="text-xs text-slate-500">{analyzed ? 'Analysis Complete' : 'Photo Capture'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!analyzed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Capture Posture Photos</h2>
              <p className="text-sm text-slate-500 mb-6">
                Take front and side photos against a plain background. Wear fitted clothing for best results.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {(['front', 'left', 'right'] as const).map((side) => (
                  <div key={side} className="text-center">
                    <div
                      className={`aspect-[3/4] rounded-xl border-2 border-dashed ${
                        photos[side] ? 'border-violet-500 bg-slate-50' : 'border-slate-300'
                      } flex items-center justify-center cursor-pointer overflow-hidden relative mb-2`}
                      onClick={() => handlePhotoCapture(side)}
                    >
                      {photos[side] ? (
                        <>
                          <img src={photos[side]} alt={side} className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <RotateCcw className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-xs text-slate-500 capitalize">{side} View</p>
                          <p className="text-[10px] text-slate-400 mt-1">Tap to capture</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-700 capitalize">{side}</p>
                    {side === 'left' && <p className="text-[10px] text-slate-400">or right side</p>}
                  </div>
                ))}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'front')}
              />
            </div>

            {/* Guide */}
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <h4 className="font-bold text-violet-900 mb-2 text-sm">Photo Tips</h4>
              <ul className="text-xs text-violet-700 space-y-1">
                <li>• Stand against a plain wall (no patterns)</li>
                <li>• Wear fitted clothing or swimwear</li>
                <li>• Arms relaxed at your sides</li>
                <li>• Face forward, look straight ahead</li>
                <li>• For side views, stand with arms folded across chest</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => navigate('/assessment')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={analyzePosture}
                disabled={isAnalyzing}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold flex items-center hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Posture
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-4xl font-black mb-1">{overallScore}</h2>
              <p className="text-violet-200">Overall Posture Score</p>
              <p className="text-sm text-violet-300 mt-2">Mild deviations detected — corrective exercises recommended</p>
            </div>

            {/* Zone Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Posture Zone Analysis</h3>
              <div className="space-y-3">
                {POSTURE_ZONES.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {zone.status === 'good' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${zone.status === 'warning' ? 'text-amber-500' : 'text-red-500'}`} />
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
                      }`}>
                        {zone.current}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">{zone.status === 'good' ? 'Normal' : zone.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body Diagram with Risk Zones */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Identified Risk Zones</h3>
              <div className="flex justify-center">
                <svg viewBox="0 0 100 120" className="w-40">
                  {/* Simplified body with risk highlights */}
                  <ellipse cx="50" cy="8" rx="8" ry="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
                  <text x="50" y="9" textAnchor="middle" fontSize="3" fill="#92400E">Head</text>
                  <rect x="47" y="15" width="6" height="5" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
                  <text x="50" y="19" textAnchor="middle" fontSize="3" fill="#991B1B">Neck</text>
                  <path d="M35 20 Q50 18 65 20 L62 45 Q50 47 38 45 Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
                  <text x="50" y="33" textAnchor="middle" fontSize="3" fill="#991B1B">Back</text>
                  <path d="M35 22 L20 40 L18 55" stroke="#FEF3C7" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <path d="M65 22 L80 40 L82 55" stroke="#FEF3C7" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <ellipse cx="50" cy="47" rx="14" ry="6" fill="#BBF7D0" />
                  <text x="50" y="48" textAnchor="middle" fontSize="3" fill="#166534">Hips OK</text>
                  <path d="M42 52 L38 78 L36 95" stroke="#FEF3C7" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M58 52 L62 78 L64 95" stroke="#BBF7D0" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-400"></div>
                  <span className="text-xs text-slate-600">Needs attention</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-amber-400"></div>
                  <span className="text-xs text-slate-600">Monitor</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-400"></div>
                  <span className="text-xs text-slate-600">Good</span>
                </div>
              </div>
            </div>

            {/* Corrective Exercises */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Recommended Corrective Exercises</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CORRECTIVE_EXERCISES.map(ex => (
                  <div key={ex.name} className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <p className="font-bold text-violet-900">{ex.name}</p>
                    <p className="text-xs text-violet-600 mt-1">Target: {ex.target}</p>
                    <p className="text-xs text-violet-400 mt-1">{ex.duration}</p>
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
              <p className="text-indigo-100 leading-relaxed">
                Posture analysis reveals mild forward head posture (8 degrees, 3 degrees above normal) and a 1.5cm shoulder height discrepancy.
                The spinal curve shows minor lateral deviation. These patterns are commonly associated with prolonged sitting and desk work.
                With consistent corrective exercises, significant improvement is expected within 4-6 weeks.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setAnalyzed(false)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Photos
              </button>
              <button
                onClick={() => navigate(`/results/${resultId}`)}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold flex items-center hover:from-violet-700 hover:to-purple-700 shadow-lg"
              >
                View Full Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
