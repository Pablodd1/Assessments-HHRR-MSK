import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  ActivitySquare,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

const BODY_REGIONS = [
  { id: 'neck', label: 'Neck', x: 50, y: 12 },
  { id: 'shoulders', label: 'Shoulders', x: 35, y: 22 },
  { id: 'upper_back', label: 'Upper Back', x: 50, y: 25 },
  { id: 'lower_back', label: 'Lower Back', x: 50, y: 38 },
  { id: 'hips', label: 'Hips', x: 50, y: 45 },
  { id: 'knees', label: 'Knees', x: 40, y: 60 },
  { id: 'ankles', label: 'Ankles', x: 40, y: 78 },
  { id: 'wrists', label: 'Wrists', x: 22, y: 30 },
];

const WORK_RISK_FACTORS = [
  'Prolonged sitting at desk',
  'Prolonged standing',
  'Repetitive motions (typing, data entry)',
  'Heavy lifting (over 25 lbs)',
  'Twisting and bending',
  'Poor ergonomic setup',
  'Vibrating equipment',
  'Work stress/pressure'
];

interface RegionState {
  painLevel: number;
  stiffness: number;
  limitedMotion: boolean;
  notes: string;
}

export const MSKScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<Record<string, RegionState>>({});
  const [workFactors, setWorkFactors] = useState<string[]>([]);
  const [activityLimitations, setActivityLimitations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultId] = useState(() => `msk-${Date.now()}`);

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
    if (!regionData[regionId]) {
      setRegionData(prev => ({
        ...prev,
        [regionId]: { painLevel: 0, stiffness: 0, limitedMotion: false, notes: '' }
      }));
    }
  };

  const updateRegion = (field: keyof RegionState, value: any) => {
    if (!selectedRegion) return;
    setRegionData(prev => ({
      ...prev,
      [selectedRegion]: { ...prev[selectedRegion], [field]: value }
    }));
  };

  const calculateRiskScore = () => {
    const regions = Object.values(regionData);
    if (regions.length === 0) return 0;
    const totalPain = regions.reduce((acc, r) => acc + r.painLevel, 0);
    const avgPain = totalPain / regions.length;
    const limitedCount = regions.filter(r => r.limitedMotion).length;
    const factorBonus = (workFactors.length * 3) + (limitedCount * 10);
    return Math.min(100, Math.round(avgPain * 7 + factorBonus));
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score < 55) return { label: 'Moderate Risk', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (score < 75) return { label: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Critical Risk', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const toggleFactor = (factor: string) => {
    setWorkFactors(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]
    );
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsAnalyzing(false);
    navigate(`/results/${resultId}`);
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <ActivitySquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">MSK Risk Self-Assessment</h1>
              <p className="text-xs text-slate-500">Step {step} of 3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-8 h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* STEP 1: Body Map */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Tap on areas where you experience pain or discomfort</h2>
              <p className="text-sm text-slate-500 mb-6">Select a body region, then rate your pain level and stiffness (0-10)</p>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Body Diagram */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-48">
                    {/* SVG Body Silhouette */}
                    <svg viewBox="0 0 100 120" className="w-full">
                      {/* Head */}
                      <ellipse cx="50" cy="8" rx="8" ry="8" fill={selectedRegion === 'neck' ? '#6366F1' : '#CBD5E1'} className="transition-colors cursor-pointer" onClick={() => handleRegionClick('neck')} />
                      {/* Neck */}
                      <rect x="47" y="15" width="6" height="5" fill={selectedRegion === 'neck' ? '#6366F1' : '#CBD5E1'} className="transition-colors cursor-pointer" onClick={() => handleRegionClick('neck')} />
                      {/* Torso */}
                      <path d="M35 20 Q50 18 65 20 L62 45 Q50 47 38 45 Z" fill={selectedRegion === 'upper_back' || selectedRegion === 'lower_back' ? '#6366F1' : '#E2E8F0'} className="transition-colors cursor-pointer" onClick={() => handleRegionClick('upper_back')} />
                      {/* Arms */}
                      <path d="M35 22 L20 40 L18 55" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" className="cursor-pointer" onClick={() => handleRegionClick('shoulders')} />
                      <path d="M65 22 L80 40 L82 55" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" className="cursor-pointer" onClick={() => handleRegionClick('shoulders')} />
                      {/* Wrists */}
                      <circle cx="18" cy="57" r="3" fill={selectedRegion === 'wrists' ? '#6366F1' : '#CBD5E1'} className="cursor-pointer" onClick={() => handleRegionClick('wrists')} />
                      <circle cx="82" cy="57" r="3" fill={selectedRegion === 'wrists' ? '#6366F1' : '#CBD5E1'} className="cursor-pointer" onClick={() => handleRegionClick('wrists')} />
                      {/* Pelvis */}
                      <ellipse cx="50" cy="47" rx="14" ry="6" fill={selectedRegion === 'hips' ? '#6366F1' : '#E2E8F0'} className="transition-colors cursor-pointer" onClick={() => handleRegionClick('hips')} />
                      {/* Legs */}
                      <path d="M42 52 L38 78 L36 95" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" className="cursor-pointer" onClick={() => handleRegionClick('knees')} />
                      <path d="M58 52 L62 78 L64 95" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" className="cursor-pointer" onClick={() => handleRegionClick('knees')} />
                      {/* Knees */}
                      <circle cx="37" cy="79" r="3" fill={selectedRegion === 'knees' ? '#6366F1' : '#CBD5E1'} className="cursor-pointer" onClick={() => handleRegionClick('knees')} />
                      <circle cx="63" cy="79" r="3" fill={selectedRegion === 'knees' ? '#6366F1' : '#CBD5E1'} className="cursor-pointer" onClick={() => handleRegionClick('knees')} />
                      {/* Ankles */}
                      <circle cx="36" cy="96" r="2.5" fill={selectedRegion === 'ankles' ? '#6366F1' : '#CBD5E1'} className="cursor-pointer" onClick={() => handleRegionClick('ankles')} />
                      <circle cx="64" cy="96" r="2.5" fill={selectedRegion === 'ankles' ? '#6366F1' : '#CBD5E1'} className="cursor-pointer" onClick={() => handleRegionClick('ankles')} />
                    </svg>

                    {/* Pain indicators */}
                    {Object.entries(regionData).filter(([_, v]) => v.painLevel > 0).map(([region]) => {
                      const reg = BODY_REGIONS.find(r => r.id === region);
                      if (!reg) return null;
                      return (
                        <div
                          key={region}
                          className="absolute w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                          style={{ left: `${reg.x - 10}%`, top: `${reg.y}%` }}
                        >
                          <span className="text-white text-[8px] font-black">
                            {regionData[region]?.painLevel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Region Detail Panel */}
                <div className="flex-1">
                  {selectedRegion ? (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 capitalize">
                        {selectedRegion.replace('_', ' ')}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Pain Level: {regionData[selectedRegion]?.painLevel || 0}/10
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={regionData[selectedRegion]?.painLevel || 0}
                            onChange={e => updateRegion('painLevel', parseInt(e.target.value))}
                            className="w-full accent-red-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Stiffness: {regionData[selectedRegion]?.stiffness || 0}/10
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={regionData[selectedRegion]?.stiffness || 0}
                            onChange={e => updateRegion('stiffness', parseInt(e.target.value))}
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="limited"
                            checked={regionData[selectedRegion]?.limitedMotion || false}
                            onChange={e => updateRegion('limitedMotion', e.target.checked)}
                            className="w-4 h-4 accent-indigo-600"
                          />
                          <label htmlFor="limited" className="text-sm font-medium text-slate-700">
                            Limited range of motion
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      Select a body region to rate
                    </div>
                  )}

                  {/* Selected regions summary */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(regionData).filter(([_, v]) => v.painLevel > 0).map(([region]) => (
                      <span key={region} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold capitalize">
                        {region.replace('_', ' ')}: {regionData[region].painLevel}/10
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center hover:bg-indigo-700 transition-colors"
              >
                Next: Work Factors
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Work Risk Factors */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Work-Related Risk Factors</h2>
              <p className="text-sm text-slate-500 mb-6">Select all factors that apply to your typical workday</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WORK_RISK_FACTORS.map(factor => (
                  <button
                    key={factor}
                    onClick={() => toggleFactor(factor)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      workFactors.includes(factor)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      workFactors.includes(factor) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                    }`}>
                      {workFactors.includes(factor) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{factor}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center hover:bg-indigo-700 transition-colors"
              >
                Next: Activity Impact
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Activity Limitations & Results */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Activity Limitations</h2>
              <p className="text-sm text-slate-500 mb-6">Select any activities that are currently difficult due to pain or discomfort</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Lifting heavy objects',
                  'Prolonged standing (>2 hours)',
                  'Prolonged sitting',
                  'Walking long distances',
                  'Climbing stairs',
                  'Bending or stooping',
                  'Twisting motions',
                  'Overhead reaching',
                  'Keyboard/mouse work',
                  'Driving'
                ].map(activity => (
                  <button
                    key={activity}
                    onClick={() => setActivityLimitations(prev =>
                      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
                    )}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      activityLimitations.includes(activity)
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      activityLimitations.includes(activity) ? 'bg-amber-500 border-amber-500' : 'border-slate-300'
                    }`}>
                      {activityLimitations.includes(activity) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{activity}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Summary */}
            <div className={`rounded-2xl border-2 p-6 ${riskLevel.bg} border-transparent`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Your MSK Risk Score</h3>
                  <p className="text-sm text-slate-500">Based on your assessment responses</p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black ${riskLevel.color}`}>{riskScore}</span>
                  <span className="text-slate-500 text-sm">/100</span>
                </div>
              </div>
              <div className="w-full bg-white rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    riskScore < 30 ? 'bg-emerald-500' :
                    riskScore < 55 ? 'bg-amber-500' :
                    riskScore < 75 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${riskLevel.color} ${riskLevel.bg}`}>
                {riskScore < 30 ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
                {riskLevel.label}
              </span>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="text-lg font-bold">AI Analysis Preview</h3>
              </div>
              <p className="text-indigo-100">
                {riskScore >= 75
                  ? 'Your assessment indicates critical MSK risk. Lower back appears to be the primary concern, likely work-related. We strongly recommend a clinical evaluation and ergonomic assessment.'
                  : riskScore >= 55
                  ? 'Your assessment shows elevated MSK risk with multiple body regions affected. Work factors and activity limitations suggest a structured intervention could significantly reduce your risk.'
                  : riskScore >= 30
                  ? 'Your assessment shows moderate MSK risk. With targeted corrective exercises and ergonomic adjustments, your risk level can be substantially improved.'
                  : 'Your assessment shows relatively low MSK risk. Continue maintaining good posture and ergonomic habits to prevent future issues.'}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold flex items-center hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg disabled:opacity-50"
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
                    Complete Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
