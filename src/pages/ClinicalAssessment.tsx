import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActivitySquare,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Stethoscope,
  User,
  X
} from 'lucide-react';
import { useDemo, MSKRegion } from '../store/DemoContext';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const BODY_REGIONS = [
  { id: 'head_neck',      label: 'Head/Neck',      svgId: 'head-neck'    },
  { id: 'shoulders',      label: 'Shoulders',      svgId: 'shoulders'    },
  { id: 'upper_back',     label: 'Upper Back',     svgId: 'upper-back'   },
  { id: 'lower_back',     label: 'Lower Back',     svgId: 'lower-back'   },
  { id: 'hips',           label: 'Hips',           svgId: 'hips'         },
  { id: 'wrists_hands',    label: 'Wrists/Hands',   svgId: 'wrists-hands' },
  { id: 'knees',          label: 'Knees',          svgId: 'knees'        },
  { id: 'ankles_feet',    label: 'Ankles/Feet',    svgId: 'ankles-feet'  },
] as const;

type RegionId = typeof BODY_REGIONS[number]['id'];

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const getRiskLevel = (score: number) => {
  if (score <= 30) return { label: 'Low',      color: 'text-emerald-600', bg: 'bg-emerald-100',  dot: 'bg-emerald-500',  badge: 'bg-emerald-500'   };
  if (score <= 60) return { label: 'Moderate', color: 'text-amber-600',   bg: 'bg-amber-100',    dot: 'bg-amber-500',    badge: 'bg-amber-500'    };
  return            { label: 'High',      color: 'text-red-600',     bg: 'bg-red-100',      dot: 'bg-red-500',      badge: 'bg-red-500'      };
};

const HEAVY_LIFTING_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely (1-2x/week)' },
  { value: 2, label: 'Sometimes (3-4x/week)' },
  { value: 3, label: 'Often (5+/week)' },
];

const REPETITIVE_MOTION_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Minimal (<2 hrs/day)' },
  { value: 2, label: 'Moderate (2-4 hrs/day)' },
  { value: 3, label: 'High (>4 hrs/day)' },
];

const ERGONOMICS_OPTIONS = [
  { value: 1, label: 'Very Poor' },
  { value: 2, label: 'Poor' },
  { value: 3, label: 'Fair' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
];

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const ClinicalAssessment = () => {
  const { currentUser, addClinicalAssessment } = useDemo();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Body region pain data
  const [regionData, setRegionData] = useState<Record<string, { painLevel: number; notes: string }>>({});

  // Selected region for editing
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);

  // Work factors
  const [hoursSitting, setHoursSitting] = useState(4);
  const [hoursStanding, setHoursStanding] = useState(2);
  const [heavyLifting, setHeavyLifting] = useState(0);
  const [repetitiveMotion, setRepetitiveMotion] = useState(0);
  const [ergonomicsRating, setErgonomicsRating] = useState(3);

  // AI & submission state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // ── Computed ──
  const riskScore = useMemo(() => {
    const regions = Object.values(regionData) as { painLevel: number; notes: string }[];
    if (regions.length === 0) return 0;

    // Pain score contribution (40% weight)
    const totalPain = regions.reduce((a, r) => a + r.painLevel, 0);
    const avgPain = regions.length > 0 ? totalPain / regions.length : 0;
    const painContribution = (avgPain / 10) * 40;

    // Work factors contribution (60% weight)
    // Sitting: +5 if >6hrs, +3 if >4hrs
    const sittingScore = hoursSitting > 6 ? 15 : hoursSitting > 4 ? 8 : hoursSitting > 2 ? 4 : 0;
    // Standing: +5 if >6hrs, +3 if >4hrs
    const standingScore = hoursStanding > 6 ? 15 : hoursStanding > 4 ? 8 : hoursStanding > 2 ? 4 : 0;
    // Heavy lifting: 0-12
    const liftingScore = heavyLifting * 4;
    // Repetitive motion: 0-15
    const motionScore = repetitiveMotion * 5;
    // Ergonomics: inverse (5=0, 4=3, 3=6, 2=9, 1=12)
    const ergonomicsScore = (6 - ergonomicsRating) * 3;

    const workContribution = sittingScore + standingScore + liftingScore + motionScore + ergonomicsScore;

    return Math.min(100, Math.round(painContribution + workContribution));
  }, [regionData, hoursSitting, hoursStanding, heavyLifting, repetitiveMotion, ergonomicsRating]);

  const riskLevel = useMemo(() => getRiskLevel(riskScore), [riskScore]);

  const activeRegionCount = (Object.values(regionData) as { painLevel: number; notes: string }[]).filter(r => r.painLevel > 0).length;

  const regionBreakdown = useMemo(() => {
    return BODY_REGIONS.map(reg => ({
      ...reg,
      painLevel: regionData[reg.id]?.painLevel || 0,
      riskContribution: regionData[reg.id]?.painLevel ? Math.round((regionData[reg.id].painLevel / 10) * 15) : 0
    })).sort((a, b) => b.painLevel - a.painLevel);
  }, [regionData]);

  // ── Handlers ──
  const handleRegionClick = useCallback((regionId: RegionId) => {
    setSelectedRegion(prev => prev === regionId ? null : regionId);
    if (!regionData[regionId]) {
      setRegionData(prev => ({
        ...prev,
        [regionId]: { painLevel: 0, notes: '' }
      }));
    }
  }, [regionData]);

  const updateRegionPain = useCallback((value: number) => {
    if (!selectedRegion) return;
    setRegionData(prev => ({
      ...prev,
      [selectedRegion]: { ...prev[selectedRegion], painLevel: value }
    }));
  }, [selectedRegion]);

  const updateRegionNotes = useCallback((value: string) => {
    if (!selectedRegion) return;
    setRegionData(prev => ({
      ...prev,
      [selectedRegion]: { ...prev[selectedRegion], notes: value }
    }));
  }, [selectedRegion]);

  const canAdvanceStep1 = activeRegionCount > 0;
  const canAdvanceStep2 = true; // work factors always have defaults

  const handleAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);

    // Build prompt for Gemini
    const regionsWithPain = (Object.entries(regionData) as [string, { painLevel: number; notes: string }][])
      .filter(([_, data]) => data.painLevel > 0)
      .map(([name, data]) => `${name}: pain ${data.painLevel}/10${data.notes ? ` (${data.notes})` : ''}`)
      .join('; ');

    const workFactorsDesc = [
      hoursSitting > 4 ? `${hoursSitting} hrs sitting/day` : null,
      hoursStanding > 4 ? `${hoursStanding} hrs standing/day` : null,
      heavyLifting > 0 ? `Heavy lifting: ${HEAVY_LIFTING_OPTIONS[heavyLifting].label}` : null,
      repetitiveMotion > 0 ? `Repetitive motion: ${REPETITIVE_MOTION_OPTIONS[repetitiveMotion].label}` : null,
      `Ergonomics: ${ERGONOMICS_OPTIONS.find(o => o.value === ergonomicsRating)?.label}`
    ].filter(Boolean).join(', ');

    const prompt = `
You are an MSK (Musculoskeletal) clinical risk analyst. Generate a personalized prevention plan based on:

Employee Assessment Data:
- Pain Regions: ${regionsWithPain || 'No significant pain reported'}
- Work Factors: ${workFactorsDesc}
- Overall Risk Score: ${riskScore}/100 (${riskLevel.label} Risk)

Generate a JSON response with:
- summary: (string) 2-3 sentence clinical summary of the employee's MSK risk profile
- preventionPlan: (array of 5-6 strings) specific, actionable prevention recommendations
- priorityAreas: (array of 2-3 strings) the body regions requiring most attention
- followUpActions: (array of 2-3 strings) recommended next steps for HR/clinical team
- workModifications: (array of 2-3 strings) suggested workplace modifications

Return ONLY valid JSON.
`.trim();

    try {
      const response = await fetch('/api/analyze-msk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentData: { regions: regionData, workFactors: { hoursSitting, hoursStanding, heavyLifting, repetitiveMotion, ergonomicsRating }, riskScore, riskLevel: riskLevel.label },
          prompt
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setAiReport(data);
    } catch (error) {
      // Fallback: generate a simulated response
      const highPainRegions = Object.entries(regionData)
        .filter(([_, d]) => d.painLevel >= 7)
        .map(([k]) => k);
      const moderatePainRegions = Object.entries(regionData)
        .filter(([_, d]) => d.painLevel >= 4 && d.painLevel < 7)
        .map(([k]) => k);

      setAiReport({
        summary: `Employee presents with ${riskLevel.label.toLowerCase()} MSK risk (score: ${riskScore}/100). ${highPainRegions.length > 0 ? `High pain reported in ${highPainRegions.join(', ')}.` : ''} ${moderatePainRegions.length > 0 ? `Moderate pain in ${moderatePainRegions.join(', ')}.` : ''} Work factors contribute to overall risk profile.`,
        preventionPlan: [
          'Schedule ergonomic workstation assessment within 2 weeks',
          'Implement daily stretching routine targeting affected regions',
          'Consider physical therapy referral for high-pain areas',
          'Review and adjust work schedule to incorporate movement breaks',
          'Provide supportive equipment (keyboard, chair, footrest) as needed',
          'Quarterly MSK reassessment to monitor progress'
        ],
        priorityAreas: highPainRegions.length > 0 ? highPainRegions : moderatePainRegions.slice(0, 3),
        followUpActions: [
          'Review with employee within 5 business days',
          'Coordinate with occupational health if work restrictions needed',
          'Document assessment findings in employee health record'
        ],
        workModifications: [
          hoursSitting > 4 ? 'Consider sit-stand desk converter' : null,
          heavyLifting > 1 ? 'Evaluate lifting techniques and provide training' : null,
          ergonomicsRating <= 2 ? 'Priority: improve ergonomic setup' : null
        ].filter(Boolean)
      });
    }

    setIsAnalyzing(false);
    setStep(4);
  }, [regionData, hoursSitting, hoursStanding, heavyLifting, repetitiveMotion, ergonomicsRating, riskScore, riskLevel]);

  const handleSaveAssessment = useCallback(async () => {
    if (!currentUser?.employeeId) return;
    setIsSaving(true);

    const mskRegions: MSKRegion[] = Object.entries(regionData).map(([name, data]) => ({
      name,
      painLevel: data.painLevel,
      stiffness: 0,
      limitedMotion: data.painLevel >= 7,
      notes: data.notes || undefined
    }));

    const now = new Date().toISOString();

    const assessmentPayload = {
      id: `ca-${Date.now()}`,
      employeeId: currentUser.employeeId,
      assessmentDate: now,
      assessorName: currentUser.name,
      type: 'MSK_SCREEN' as const,
      mskData: {
        id: `msk-${Date.now()}`,
        employeeId: currentUser.employeeId,
        assessmentDate: now,
        regions: mskRegions,
        totalRiskScore: riskScore,
        riskLevel: riskLevel.label as 'Low' | 'Moderate' | 'High',
        workRiskFactors: [
          hoursSitting > 4 ? `Sitting: ${hoursSitting}hrs/day` : null,
          hoursStanding > 4 ? `Standing: ${hoursStanding}hrs/day` : null,
          heavyLifting > 0 ? `Heavy lifting: ${HEAVY_LIFTING_OPTIONS[heavyLifting].label}` : null,
          repetitiveMotion > 0 ? `Repetitive motion: ${REPETITIVE_MOTION_OPTIONS[repetitiveMotion].label}` : null,
          `Ergonomics: ${ERGONOMICS_OPTIONS.find(o => o.value === ergonomicsRating)?.label}`
        ].filter(Boolean) as string[],
        activityLimitations: mskRegions.filter(r => r.painLevel >= 7).map(r => r.name),
        aiSummary: aiReport?.summary || 'AI-powered MSK risk assessment completed.',
        recommendations: aiReport?.preventionPlan || [],
        followUpRecommended: riskScore > 60
      },
      clinicalNotes: mskRegions
        .filter(r => r.painLevel > 5)
        .map(r => `${r.name}: pain ${r.painLevel}/10`)
        .join(', '),
      aiSummary: aiReport?.summary || 'AI-powered MSK risk assessment completed.',
      recommendedPrograms: aiReport?.preventionPlan || [],
      status: 'completed' as const
    };

    try {
      await fetch('/api/clinical-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentPayload)
      });
    } catch (error) {
      // Continue even if API fails - save locally
    }

    // Always add to local state
    addClinicalAssessment(currentUser.employeeId, assessmentPayload);

    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setShowResults(true);
  }, [currentUser, regionData, hoursSitting, hoursStanding, heavyLifting, repetitiveMotion, ergonomicsRating, riskScore, riskLevel, aiReport, addClinicalAssessment]);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step > 1 ? setStep(prev => (prev - 1) as 1|2|3|4) : window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">MSK Clinical Assessment</h1>
              <p className="text-xs text-slate-500">
                Step {step} of 4 — {
                  step === 1 ? 'Body Map' :
                  step === 2 ? 'Pain Details' :
                  step === 3 ? 'Work Factors' : 'Results'
                }
              </p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {([1, 2, 3, 4] as const).map(s => (
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

      <div className="max-w-5xl mx-auto p-6">
        <AnimatePresence mode="wait">
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
                    <h2 className="text-xl font-bold text-slate-900">Body Region Selection</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Tap each area where you feel pain or discomfort</p>
                  </div>
                  {activeRegionCount > 0 && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                      {activeRegionCount} area{activeRegionCount > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-6">
                  {/* Body SVG */}
                  <div className="flex-1 flex justify-center">
                    <div className="relative w-52">
                      <svg viewBox="0 0 100 130" className="w-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Head + Neck */}
                        <ellipse
                          cx="50" cy="8" rx="9" ry="9"
                          fill={selectedRegion === 'head_neck' ? '#6366F1' : regionData['head_neck']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['head_neck'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('head_neck')}
                        />
                        <rect
                          x="47" y="16" width="6" height="6"
                          fill={selectedRegion === 'head_neck' ? '#6366F1' : regionData['head_neck']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['head_neck'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('head_neck')}
                        />

                        {/* Shoulders */}
                        <ellipse
                          cx="33" cy="24" rx="7" ry="4"
                          fill={selectedRegion === 'shoulders' ? '#6366F1' : regionData['shoulders']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['shoulders'].painLevel / 10) * 0.6})` : '#E2E8F0'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('shoulders')}
                        />
                        <ellipse
                          cx="67" cy="24" rx="7" ry="4"
                          fill={selectedRegion === 'shoulders' ? '#6366F1' : regionData['shoulders']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['shoulders'].painLevel / 10) * 0.6})` : '#E2E8F0'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('shoulders')}
                        />

                        {/* Upper Back */}
                        <path
                          d="M36 28 Q50 25 64 28 L62 38 Q50 40 38 38 Z"
                          fill={selectedRegion === 'upper_back' ? '#6366F1' : regionData['upper_back']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['upper_back'].painLevel / 10) * 0.6})` : '#E2E8F0'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('upper_back')}
                        />

                        {/* Lower Back */}
                        <path
                          d="M38 38 Q50 36 62 38 L60 48 Q50 50 40 48 Z"
                          fill={selectedRegion === 'lower_back' ? '#6366F1' : regionData['lower_back']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['lower_back'].painLevel / 10) * 0.6})` : '#E2E8F0'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('lower_back')}
                        />

                        {/* Arms */}
                        <path d="M26 26 L14 44 L12 64" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M74 26 L86 44 L88 64" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />

                        {/* Wrists/Hands */}
                        <circle
                          cx="12" cy="66" r="4"
                          fill={selectedRegion === 'wrists_hands' ? '#6366F1' : regionData['wrists_hands']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['wrists_hands'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('wrists_hands')}
                        />
                        <circle
                          cx="88" cy="66" r="4"
                          fill={selectedRegion === 'wrists_hands' ? '#6366F1' : regionData['wrists_hands']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['wrists_hands'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('wrists_hands')}
                        />

                        {/* Hips */}
                        <ellipse
                          cx="50" cy="52" rx="16" ry="7"
                          fill={selectedRegion === 'hips' ? '#6366F1' : regionData['hips']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['hips'].painLevel / 10) * 0.6})` : '#E2E8F0'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('hips')}
                        />

                        {/* Legs */}
                        <path d="M42 58 L38 78" stroke="#CBD5E1" strokeWidth="7" fill="none" strokeLinecap="round" />
                        <path d="M58 58 L62 78" stroke="#CBD5E1" strokeWidth="7" fill="none" strokeLinecap="round" />
                        <path d="M38 78 L36 100 L35 110" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M62 78 L64 100 L65 110" stroke="#CBD5E1" strokeWidth="6" fill="none" strokeLinecap="round" />

                        {/* Knees */}
                        <circle
                          cx="36" cy="80" r="4"
                          fill={selectedRegion === 'knees' ? '#6366F1' : regionData['knees']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['knees'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('knees')}
                        />
                        <circle
                          cx="64" cy="80" r="4"
                          fill={selectedRegion === 'knees' ? '#6366F1' : regionData['knees']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['knees'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('knees')}
                        />

                        {/* Ankles/Feet */}
                        <circle
                          cx="35" cy="112" r="3.5"
                          fill={selectedRegion === 'ankles_feet' ? '#6366F1' : regionData['ankles_feet']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['ankles_feet'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('ankles_feet')}
                        />
                        <circle
                          cx="65" cy="112" r="3.5"
                          fill={selectedRegion === 'ankles_feet' ? '#6366F1' : regionData['ankles_feet']?.painLevel ? `rgba(239,68,68,${0.2 + (regionData['ankles_feet'].painLevel / 10) * 0.6})` : '#CBD5E1'}
                          className="transition-colors cursor-pointer"
                          onClick={() => handleRegionClick('ankles_feet')}
                        />
                      </svg>

                      {/* Pain level badges */}
                      {BODY_REGIONS.map(reg => {
                        const data = regionData[reg.id];
                        if (!data || data.painLevel === 0) return null;
                        const posMap: Record<string, { x: string; y: string }> = {
                          head_neck:    { x: '54%', y: '10%'  },
                          shoulders:    { x: '75%', y: '18%'  },
                          upper_back:   { x: '62%', y: '28%'  },
                          lower_back:   { x: '62%', y: '38%'  },
                          hips:         { x: '62%', y: '48%'  },
                          wrists_hands: { x: '90%', y: '52%'  },
                          knees:        { x: '34%', y: '62%'  },
                          ankles_feet: { x: '34%', y: '86%'  },
                        };
                        const pos = posMap[reg.id];
                        return (
                          <div
                            key={reg.id}
                            className="absolute flex items-center justify-center text-white text-[9px] font-black"
                            style={{
                              left: pos.x,
                              top: pos.y,
                              width: 18,
                              height: 18,
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

                  {/* Region list */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Body Regions</h3>
                    {BODY_REGIONS.map(reg => {
                      const data = regionData[reg.id];
                      const hasPain = data && data.painLevel > 0;
                      return (
                        <button
                          key={reg.id}
                          onClick={() => handleRegionClick(reg.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                            selectedRegion === reg.id
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : hasPain
                                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-200'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-medium text-sm">{reg.label}</span>
                          {hasPain && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              data.painLevel >= 7 ? 'bg-red-100 text-red-600' :
                              data.painLevel >= 4 ? 'bg-amber-100 text-amber-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}>
                              {data.painLevel}/10
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Next button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canAdvanceStep1}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    canAdvanceStep1
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Pain Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Pain Details ── */}
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
                <h2 className="text-xl font-bold text-slate-900 mb-1">Rate Pain by Region</h2>
                <p className="text-sm text-slate-500 mb-6">Slide to set pain level (0 = no pain, 10 = worst pain)</p>

                <div className="space-y-6">
                  {BODY_REGIONS.filter(reg => regionData[reg.id]?.painLevel > 0).map(reg => {
                    const data = regionData[reg.id];
                    return (
                      <div key={reg.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-slate-800 capitalize">{reg.label}</h3>
                          <span className={`text-lg font-black ${
                            (data?.painLevel || 0) >= 7 ? 'text-red-500' :
                            (data?.painLevel || 0) >= 4 ? 'text-amber-500' : 'text-emerald-600'
                          }`}>
                            {data?.painLevel || 0}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={data?.painLevel || 1}
                          onChange={e => updateRegionPain(parseInt(e.target.value))}
                          className="w-full accent-red-500 h-2 bg-slate-200 rounded-full"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-0.5">
                          <span>Mild</span><span>Moderate</span><span>Severe</span>
                        </div>
                        <textarea
                          value={data?.notes || ''}
                          onChange={e => updateRegionNotes(e.target.value)}
                          placeholder="Additional notes (optional)..."
                          maxLength={200}
                          rows={2}
                          className="w-full mt-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
                        />
                      </div>
                    );
                  })}

                  {activeRegionCount === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No pain regions selected. Go back to select regions.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={activeRegionCount === 0}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    activeRegionCount > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Work Factors <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Work Factors ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Work Environment Factors</h2>
                <p className="text-sm text-slate-500 mb-6">Help us understand your typical work day</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Hours Sitting */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Hours Sitting/Day
                      </label>
                      <span className="text-lg font-black text-indigo-600">{hoursSitting}h</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={hoursSitting}
                      onChange={e => setHoursSitting(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h+</span>
                    </div>
                  </div>

                  {/* Hours Standing */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Hours Standing/Day
                      </label>
                      <span className="text-lg font-black text-indigo-600">{hoursStanding}h</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={hoursStanding}
                      onChange={e => setHoursStanding(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h+</span>
                    </div>
                  </div>

                  {/* Heavy Lifting */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <ActivitySquare className="w-4 h-4 text-slate-400" /> Heavy Lifting Frequency
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HEAVY_LIFTING_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setHeavyLifting(opt.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            heavyLifting === opt.value
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Repetitive Motion */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-slate-400" /> Repetitive Motion
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {REPETITIVE_MOTION_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setRepetitiveMotion(opt.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            repetitiveMotion === opt.value
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ergonomics Rating */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-slate-400" /> Workplace Ergonomics Rating
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {ERGONOMICS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setErgonomicsRating(opt.value)}
                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          ergonomicsRating === opt.value
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Preview */}
              <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-300 text-sm font-medium">Current Risk Estimate</p>
                    <p className={`text-3xl font-black mt-1 ${riskLevel.color}`}>{riskScore}/100</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${riskLevel.bg} ${riskLevel.color} font-bold text-sm`}>
                    {riskLevel.label} Risk
                  </div>
                </div>
                <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${riskScore <= 30 ? 'bg-emerald-500' : riskScore <= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate AI Report
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Results ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Risk Score Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">MSK Risk Assessment Results</h2>
                    <p className="text-sm text-slate-500">Assessment completed for {currentUser?.name}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${riskLevel.bg} ${riskLevel.color} font-bold`}>
                    {riskLevel.label} Risk
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={riskScore <= 30 ? '#10B981' : riskScore <= 60 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="10"
                        strokeDasharray={`${riskScore * 2.64} 264`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-black ${riskLevel.color}`}>{riskScore}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Pain Contribution</span>
                      <span className="font-medium text-slate-700">{Math.round((riskScore * 0.4))} pts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Work Factors</span>
                      <span className="font-medium text-slate-700">{Math.round((riskScore * 0.6))} pts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Active Regions</span>
                      <span className="font-medium text-slate-700">{activeRegionCount}</span>
                    </div>
                  </div>
                </div>

                {/* Region Breakdown */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Risk Breakdown by Region</h3>
                  <div className="space-y-2">
                    {regionBreakdown.filter(r => r.painLevel > 0).map(reg => (
                      <div key={reg.id} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-28">{reg.label}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${reg.painLevel >= 7 ? 'bg-red-500' : reg.painLevel >= 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${reg.painLevel * 10}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-10">{reg.painLevel}/10</span>
                        <span className="text-xs text-slate-400 w-10">+{reg.riskContribution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Report */}
              {aiReport && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-900">AI Prevention Plan</h3>
                  </div>

                  {aiReport.summary && (
                    <div className="bg-white rounded-xl p-4 mb-4 border border-indigo-100">
                      <p className="text-sm text-slate-700">{aiReport.summary}</p>
                    </div>
                  )}

                  {aiReport.preventionPlan && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-bold text-slate-700">Recommended Actions:</h4>
                      {aiReport.preventionPlan.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-4 py-2 border border-indigo-100">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiReport.priorityAreas && aiReport.priorityAreas.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Priority Areas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiReport.priorityAreas.map((area: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiReport.workModifications && aiReport.workModifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Work Modifications:</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiReport.workModifications.map((mod: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Recalculate
                </button>
                <button
                  onClick={handleSaveAssessment}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Assessment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Assessment Saved!</h3>
              <p className="text-slate-500 mb-6">
                The MSK clinical assessment has been saved and is ready for review.
              </p>
              <button
                onClick={() => setShowResults(false)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
