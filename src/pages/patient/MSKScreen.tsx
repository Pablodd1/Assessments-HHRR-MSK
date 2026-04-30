import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  ActivitySquare,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  X,
  StickyNote,
  User
} from 'lucide-react';
import { useDemo, MSKAssessment, MSKRegion } from '../../store/DemoContext';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const BODY_REGIONS = [
  { id: 'neck',        label: 'Neck',        svgId: 'neck-click',    side: false },
  { id: 'shoulders',    label: 'Shoulders',    svgId: 'shoulders-click', side: false },
  { id: 'upper_back',   label: 'Upper Back',   svgId: 'upper-back',    side: false },
  { id: 'lower_back',   label: 'Lower Back',   svgId: 'lower-back',    side: false },
  { id: 'hips',         label: 'Hips',         svgId: 'hips',          side: false },
  { id: 'wrists',       label: 'Wrists',       svgId: 'wrists',        side: true  },
  { id: 'knees',        label: 'Knees',        svgId: 'knees',         side: true  },
  { id: 'ankles',       label: 'Ankles',       svgId: 'ankles',         side: true  },
] as const;

const WORK_RISK_FACTORS = [
  'Prolonged sitting at desk',
  'Prolonged standing',
  'Repetitive motions (typing, data entry)',
  'Heavy lifting (over 25 lbs)',
  'Twisting and bending',
  'Poor ergonomic setup',
  'Vibrating equipment',
  'Work stress / pressure'
] as const;

const ACTIVITY_LIMITATIONS = [
  'Lifting heavy objects',
  'Prolonged standing (>2 hours)',
  'Prolonged sitting',
  'Walking long distances',
  'Climbing stairs',
  'Bending or stooping',
  'Twisting motions',
  'Overhead reaching',
  'Keyboard / mouse work',
  'Driving'
] as const;

type RegionId = typeof BODY_REGIONS[number]['id'];
type WorkFactor = typeof WORK_RISK_FACTORS[number];
type Activity = typeof ACTIVITY_LIMITATIONS[number];

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const getRiskLevel = (score: number) => {
  if (score < 30) return { label: 'Low Risk',      color: 'text-emerald-600', bg: 'bg-emerald-100',  dot: 'bg-emerald-500'   };
  if (score < 55) return { label: 'Moderate Risk', color: 'text-amber-600',   bg: 'bg-amber-100',   dot: 'bg-amber-500'    };
  if (score < 75) return { label: 'High Risk',      color: 'text-orange-600',  bg: 'bg-orange-100',  dot: 'bg-orange-500'   };
  return           { label: 'Critical Risk',   color: 'text-red-600',     bg: 'bg-red-100',     dot: 'bg-red-500'      };
};

const buildAIRecommendations = (
  regionData: Record<string, { painLevel: number; limitedMotion: boolean }>,
  workFactors: WorkFactor[],
  activityLimitations: Activity[]
): string[] => {
  const recs: string[] = [];
  const entries = Object.entries(regionData);
  const highPain = entries.filter(([_, r]) => r.painLevel >= 7);
  const limited = entries.filter(([_, r]) => r.limitedMotion);

  if (highPain.length > 0) recs.push('Urgent medical evaluation recommended for high-pain regions');
  if (limited.length > 0)  recs.push('Physical therapy referral for range-of-motion issues');
  if (workFactors.includes('Poor ergonomic setup')) recs.push('Ergonomic workstation assessment');
  if (workFactors.includes('Heavy lifting (over 25 lbs)')) recs.push('Safe lifting protocol training');
  if (workFactors.includes('Prolonged sitting at desk')) recs.push('Desk stretch and movement program');
  if (workFactors.includes('Prolonged standing')) recs.push('Anti-fatigue mat and standing rotation schedule');
  if (activityLimitations.includes('Lifting heavy objects')) recs.push('Work restrictions review with employer');
  if (recs.length === 0) recs.push('Maintain current activity levels with quarterly reassessment');
  return recs;
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const MSKScreen = () => {
  const navigate = useNavigate();
  const { currentUser, addClinicalAssessment, employees } = useDemo();

  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [regionData, setRegionData]   = useState<Record<string, {
    painLevel: number;
    stiffness: number;
    limitedMotion: boolean;
    notes: string;
  }>>({});
  const [workFactors, setWorkFactors] = useState<WorkFactor[]>([]);
  const [activityLimitations, setActivityLimitations] = useState<Activity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Computed ──
  const riskScore = useMemo(() => {
    const regions = Object.values(regionData) as { painLevel: number; stiffness: number; limitedMotion: boolean; notes: string }[];
    if (regions.length === 0) return 0;
    const avgPain       = regions.reduce((a, r) => a + r.painLevel, 0) / regions.length;
    const limitedCount  = regions.filter(r => r.limitedMotion).length;
    const stiffnessAvg   = regions.reduce((a, r) => a + r.stiffness, 0) / regions.length;
    const factorBonus    = workFactors.length * 3 + limitedCount * 10;
    return Math.min(100, Math.round(avgPain * 6 + stiffnessAvg * 1.5 + factorBonus));
  }, [regionData, workFactors]);

  const riskLevel = useMemo(() => getRiskLevel(riskScore), [riskScore]);
  const activeRegionCount = (Object.values(regionData) as { painLevel: number; stiffness: number; limitedMotion: boolean; notes: string }[]).filter(r => r.painLevel > 0).length;

  // ── Handlers ──
  const handleRegionClick = useCallback((regionId: RegionId) => {
    setSelectedRegion(prev => prev === regionId ? null : regionId);
    if (!regionData[regionId]) {
      setRegionData(prev => ({
        ...prev,
        [regionId]: { painLevel: 0, stiffness: 0, limitedMotion: false, notes: '' }
      }));
    }
  }, [regionData]);

  const updateRegion = useCallback(<K extends keyof typeof regionData[string]>(
    field: K,
    value: typeof regionData[string][K]
  ) => {
    if (!selectedRegion) return;
    setRegionData(prev => ({
      ...prev,
      [selectedRegion]: { ...prev[selectedRegion], [field]: value }
    }));
  }, [selectedRegion]);

  const toggleWorkFactor = useCallback((factor: WorkFactor) => {
    setWorkFactors(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]
    );
  }, []);

  const toggleActivity = useCallback((activity: Activity) => {
    setActivityLimitations(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  }, []);

  const canAdvanceStep1 = activeRegionCount > 0;

  const handleSubmit = useCallback(async () => {
    if (!currentUser?.employeeId) return;
    setIsSubmitting(true);

    const employee = employees.find(e => e.id === currentUser.employeeId);
    const id = `msk-${Date.now()}`;
    const now = new Date().toISOString();

    const mskRegions: MSKRegion[] = (Object.entries(regionData) as [string, { painLevel: number; stiffness: number; limitedMotion: boolean; notes: string }][]).map(([name, data]) => ({
      name,
      painLevel: data.painLevel,
      stiffness: data.stiffness,
      limitedMotion: data.limitedMotion,
      notes: data.notes || undefined
    }));

    const assessment: MSKAssessment = {
      id,
      employeeId: currentUser.employeeId,
      assessmentDate: now,
      regions: mskRegions,
      totalRiskScore: riskScore,
      riskLevel: riskLevel.label.split(' ')[0] as MSKAssessment['riskLevel'],
      workRiskFactors: [...workFactors],
      activityLimitations: [...activityLimitations],
      aiSummary: 'AI-powered MSK risk assessment completed.',
      recommendations: buildAIRecommendations(regionData, workFactors, activityLimitations),
      followUpRecommended: riskScore >= 65
    };

    addClinicalAssessment(currentUser.employeeId, {
      id: `ca-${Date.now()}`,
      employeeId: currentUser.employeeId,
      assessmentDate: now,
      assessorName: 'Self-Assessment',
      type: 'MSK_SCREEN',
      mskData: assessment,
      clinicalNotes: mskRegions
        .filter(r => r.painLevel > 5)
        .map(r => `${r.name}: pain ${r.painLevel}/10`)
        .join(', '),
      aiSummary: assessment.aiSummary,
      recommendedPrograms: assessment.recommendations,
      status: 'completed'
    });

    // Simulate AI processing
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    navigate(`/results/${id}`);
  }, [currentUser, employees, regionData, workFactors, activityLimitations, riskScore, riskLevel, addClinicalAssessment, navigate]);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/assessment')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="p-2 bg-indigo-100 rounded-xl">
              <ActivitySquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">MSK Risk Self-Assessment</h1>
              <p className="text-xs text-slate-500">Step {step} of 3 — {step === 1 ? 'Body Map' : step === 2 ? 'Work Factors' : 'Activity Impact'}</p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {([1, 2, 3] as const).map(s => (
              <button
                key={s}
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-1.5 rounded-full transition-all ${
                  s < step ? 'bg-indigo-400 cursor-pointer hover:bg-indigo-500' :
                  s === step ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* ── STEP 1: Body Map ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Body Map</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Tap each area where you feel pain, stiffness, or limited motion</p>
                </div>
                {activeRegionCount > 0 && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                    {activeRegionCount} area{activeRegionCount > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-8 mt-4">
                {/* Body SVG */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-44">
                    <svg viewBox="0 0 100 120" className="w-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Head */}
                      <ellipse
                        cx="50" cy="8" rx="8" ry="8"
                        fill={selectedRegion === 'neck' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('neck')}
                      />

                      {/* Neck */}
                      <rect
                        x="47" y="15" width="6" height="5"
                        fill={selectedRegion === 'neck' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('neck')}
                      />

                      {/* Shoulders — left and right separately */}
                      <ellipse
                        cx="35" cy="22" rx="6" ry="4"
                        fill={selectedRegion === 'shoulders' ? '#6366F1' : '#E2E8F0'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('shoulders')}
                      />
                      <ellipse
                        cx="65" cy="22" rx="6" ry="4"
                        fill={selectedRegion === 'shoulders' ? '#6366F1' : '#E2E8F0'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('shoulders')}
                      />

                      {/* Upper back */}
                      <path
                        d="M38 26 Q50 24 62 26 L60 36 Q50 37 40 36 Z"
                        fill={selectedRegion === 'upper_back' ? '#6366F1' : '#E2E8F0'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('upper_back')}
                      />

                      {/* Lower back */}
                      <path
                        d="M40 36 Q50 35 60 36 L58 45 Q50 46 42 45 Z"
                        fill={selectedRegion === 'lower_back' ? '#6366F1' : '#E2E8F0'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('lower_back')}
                      />

                      {/* Arms */}
                      <path d="M29 24 L18 40 L16 57" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
                      <path d="M71 24 L82 40 L84 57" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />

                      {/* Wrists — clickable circles */}
                      <circle
                        cx="16" cy="58" r="3.5"
                        fill={selectedRegion === 'wrists' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('wrists')}
                      />
                      <circle
                        cx="84" cy="58" r="3.5"
                        fill={selectedRegion === 'wrists' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('wrists')}
                      />

                      {/* Hips / Pelvis */}
                      <ellipse
                        cx="50" cy="47" rx="14" ry="6"
                        fill={selectedRegion === 'hips' ? '#6366F1' : '#E2E8F0'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('hips')}
                      />

                      {/* Legs — stroke paths */}
                      <path d="M43 52 L40 70" stroke="#CBD5E1" strokeWidth="7" fill="none" strokeLinecap="round" />
                      <path d="M57 52 L60 70" stroke="#CBD5E1" strokeWidth="7" fill="none" strokeLinecap="round" />
                      <path d="M40 70 L38 90 L37 98" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" />
                      <path d="M60 70 L62 90 L63 98" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" />

                      {/* Knees — clickable */}
                      <circle
                        cx="38" cy="71" r="3.5"
                        fill={selectedRegion === 'knees' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('knees')}
                      />
                      <circle
                        cx="62" cy="71" r="3.5"
                        fill={selectedRegion === 'knees' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('knees')}
                      />

                      {/* Ankles — clickable */}
                      <circle
                        cx="37" cy="99" r="3"
                        fill={selectedRegion === 'ankles' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('ankles')}
                      />
                      <circle
                        cx="63" cy="99" r="3"
                        fill={selectedRegion === 'ankles' ? '#6366F1' : '#CBD5E1'}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleRegionClick('ankles')}
                      />

                      {/* Selected region outline glow */}
                      {selectedRegion && (
                        <ellipse
                          cx="50" cy="30"
                          rx="25" ry="30"
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                          opacity="0.4"
                        />
                      )}
                    </svg>

                    {/* Pain level badges */}
                    {BODY_REGIONS.map(reg => {
                      const data = regionData[reg.id];
                      if (!data || data.painLevel === 0) return null;
                      // Approximate position map
                      const posMap: Record<string, { x: string; y: string }> = {
                        neck:      { x: '54%', y: '12%'  },
                        shoulders: { x: '72%', y: '19%'  },
                        upper_back:{ x: '62%', y: '28%'  },
                        lower_back:{ x: '62%', y: '40%'  },
                        hips:      { x: '62%', y: '48%'  },
                        wrists:    { x: '88%', y: '50%'  },
                        knees:     { x: '35%', y: '60%'  },
                        ankles:    { x: '34%', y: '83%'  },
                      };
                      const pos = posMap[reg.id];
                      return (
                        <div
                          key={reg.id}
                          className="absolute flex items-center justify-center text-white text-[9px] font-black"
                          style={{
                            left: pos.x,
                            top: pos.y,
                            width: 16,
                            height: 16,
                            transform: 'translate(-50%, -50%)',
                            background: data.painLevel >= 7 ? '#EF4444' : data.painLevel >= 4 ? '#F59E0B' : '#10B981',
                            borderRadius: '50%',
                            border: '1.5px solid white',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {data.painLevel}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Region Detail Panel */}
                <div className="flex-1 space-y-4">
                  {selectedRegion ? (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 capitalize">
                          {selectedRegion.replace('_', ' ')}
                        </h3>
                        <button
                          onClick={() => setSelectedRegion(null)}
                          className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      <div className="space-y-5">
                        {/* Pain Level */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Pain Level
                            </label>
                            <span className={`text-sm font-black ${
                              (regionData[selectedRegion]?.painLevel || 0) >= 7 ? 'text-red-500' :
                              (regionData[selectedRegion]?.painLevel || 0) >= 4 ? 'text-amber-500' : 'text-emerald-600'
                            }`}>
                              {regionData[selectedRegion]?.painLevel || 0}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={regionData[selectedRegion]?.painLevel || 0}
                            onChange={e => updateRegion('painLevel', parseInt(e.target.value))}
                            className="w-full accent-red-500 h-2 bg-slate-200 rounded-full"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-0.5">
                            <span>No pain</span><span>Worst pain</span>
                          </div>
                        </div>

                        {/* Stiffness */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Stiffness
                            </label>
                            <span className="text-sm font-black text-slate-700">
                              {regionData[selectedRegion]?.stiffness || 0}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={regionData[selectedRegion]?.stiffness || 0}
                            onChange={e => updateRegion('stiffness', parseInt(e.target.value))}
                            className="w-full accent-amber-500 h-2 bg-slate-200 rounded-full"
                          />
                        </div>

                        {/* Limited Motion */}
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <input
                            type="checkbox"
                            id={`limited-${selectedRegion}`}
                            checked={regionData[selectedRegion]?.limitedMotion || false}
                            onChange={e => updateRegion('limitedMotion', e.target.checked)}
                            className="w-4 h-4 accent-indigo-600 rounded"
                          />
                          <label htmlFor={`limited-${selectedRegion}`} className="text-sm font-medium text-slate-700">
                            Limited range of motion
                          </label>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                            <StickyNote className="w-3 h-3" />
                            Notes (optional)
                          </label>
                          <textarea
                            id={`notes-${selectedRegion}`}
                            value={regionData[selectedRegion]?.notes || ''}
                            onChange={e => updateRegion('notes', e.target.value)}
                            placeholder="e.g., worse in the morning..."
                            maxLength={200}
                            rows={2}
                            className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                        <User className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        Tap a body region<br />to rate it
                      </p>
                    </div>
                  )}

                  {/* Selected regions chips */}
                  {activeRegionCount > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(regionData) as [string, { painLevel: number; stiffness: number; limitedMotion: boolean; notes: string }][])
                        .filter(([_, r]) => r.painLevel > 0)
                        .map(([region, data]) => (
                          <button
                            key={region}
                            onClick={() => setSelectedRegion(region as RegionId)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                              selectedRegion === region
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            {region.replace('_', ' ')}: {data.painLevel}/10
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validation hint */}
            {!canAdvanceStep1 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Please select and rate at least one body region before continuing
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canAdvanceStep1}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Work Factors
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Work Risk Factors ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Work-Related Risk Factors</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Select all factors that apply to your typical workday
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WORK_RISK_FACTORS.map(factor => {
                  const active = workFactors.includes(factor);
                  return (
                    <button
                      key={factor}
                      onClick={() => toggleWorkFactor(factor)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        active
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                      }`}>
                        {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${active ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {factor}
                      </span>
                    </button>
                  );
                })}
              </div>

              {workFactors.length > 0 && (
                <p className="mt-4 text-xs text-indigo-600 font-medium">
                  {workFactors.length} factor{workFactors.length > 1 ? 's' : ''} selected — these directly affect your MSK risk calculation
                </p>
              )}
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

        {/* ── STEP 3: Activity Limitations + Preview ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Activity Limitations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Activity Limitations</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Select activities that are currently difficult due to pain or discomfort
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ACTIVITY_LIMITATIONS.map(activity => {
                  const active = activityLimitations.includes(activity);
                  return (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        active
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-amber-500 border-amber-500' : 'border-slate-300'
                      }`}>
                        {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${active ? 'text-amber-700' : 'text-slate-700'}`}>
                        {activity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Risk Score Summary */}
            <div className={`rounded-2xl border-2 p-6 ${riskLevel.bg}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Your MSK Risk Score</h3>
                  <p className="text-sm text-slate-500">
                    {activeRegionCount} area{activeRegionCount !== 1 ? 's' : ''} rated · {workFactors.length} work factor{workFactors.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${riskLevel.dot}`} />
                    <span className={`text-4xl font-black ${riskLevel.color}`}>{riskScore}</span>
                    <span className="text-slate-400 text-lg">/100</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    riskScore < 30 ? 'bg-emerald-500' :
                    riskScore < 55 ? 'bg-amber-500' :
                    riskScore < 75 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${riskLevel.color} ${riskLevel.bg}`}>
                  {riskScore < 30 ? <CheckCircle2 className="w-4 h-4 mr-1" /> :
                   riskScore < 55 ? <AlertTriangle className="w-4 h-4 mr-1" /> :
                   <AlertTriangle className="w-4 h-4 mr-1" />}
                  {riskLevel.label}
                </span>
                <span className="text-xs text-slate-500">
                  {riskScore < 30 ? 'No immediate action needed' :
                   riskScore < 55 ? 'Monitor and reassess in 30 days' :
                   riskScore < 75 ? 'Intervention recommended' : 'Urgent clinical review needed'}
                </span>
              </div>
            </div>

            {/* AI Preview */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="text-lg font-bold">AI Analysis Preview</h3>
              </div>
              <p className="text-indigo-100 leading-relaxed">
                {riskScore >= 75
                  ? 'Critical MSK risk detected. Your assessment shows severe pain in multiple body regions combined with significant work-related risk factors. Urgent clinical evaluation and ergonomic intervention are strongly recommended.'
                  : riskScore >= 55
                  ? 'Elevated MSK risk identified. Multiple body regions are affected and work factors are contributing. A structured intervention plan including physical therapy and ergonomic adjustment should significantly reduce your risk.'
                  : riskScore >= 30
                  ? 'Moderate MSK risk present. Targeted corrective exercises combined with ergonomic improvements should reduce your risk level. Follow-up assessment recommended in 30 days.'
                  : 'Low MSK risk profile. Your current symptoms are minimal. Maintain good posture habits and ergonomic practices to prevent future issues.'}
              </p>
              {riskScore >= 55 && (
                <p className="mt-3 text-indigo-200 text-sm font-medium">
                  Based on your responses, you may qualify for our Back Pain Management Program or Ergonomic Assessment.
                </p>
              )}
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
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold flex items-center hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Saving Assessment...
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
