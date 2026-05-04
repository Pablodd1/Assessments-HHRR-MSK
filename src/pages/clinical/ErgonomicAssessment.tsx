import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart3,
  User,
  Info,
  Target
} from 'lucide-react';
import {
  calculateREBA,
  calculateRULA,
  calculateNIOSH,
  type REBAInput,
  type RULAInput,
  type NIOSHInput,
  type REBAResult,
  type RULAResult,
  type NIOSHResult,
} from '../../lib/rag/ergonomicScoring';
import {
  AAOS_ROM_NORMS,
  triageAssessment,
  RED_FLAGS,
  type TriageResult,
} from '../../lib/rag/romReference';

type ActiveTool = 'reba' | 'rula' | 'niosh' | 'triage' | null;

export const ErgonomicAssessment = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [rebaResult, setRebaResult] = useState<REBAResult | null>(null);
  const [rulaResult, setRulaResult] = useState<RULAResult | null>(null);
  const [nioshResult, setNioshResult] = useState<NIOSHResult | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // Demo: run REBA with sample desk worker posture
  const runSampleREBA = () => {
    const input: REBAInput = {
      trunkAngle: 25, trunkSideBend: false, trunkTwist: true,
      neckAngle: 25, neckSideBend: false, neckTwist: false,
      legsBilateral: true, legsFlexionAngle: 20,
      upperArmAngle: 50, upperArmAbducted: false, shoulderRaised: true, armSupported: false,
      lowerArmAngle: 85, wristAngle: 20, wristTwist: true,
      loadKg: 2, loadShockOrRapid: false,
      couplingQuality: 'fair',
      staticHold: true, repeatedAction: true, rapidPosturalChange: false,
    };
    setRebaResult(calculateREBA(input));
    setActiveTool('reba');
  };

  const runSampleRULA = () => {
    const input: RULAInput = {
      upperArmAngle: 45, upperArmAbducted: false, shoulderRaised: false, armSupported: true,
      lowerArmAngle: 80, lowerArmCrossesMidline: false,
      wristAngle: 15, wristDeviation: true, wristTwist: 'mid-range',
      neckAngle: 22, neckSideBend: false, neckTwist: true,
      trunkAngle: 15, trunkSideBend: false, trunkTwist: false,
      legsSupported: true,
      muscleUseStatic: true, forceLoadKg: 1, forceShockOrRepetitive: false,
    };
    setRulaResult(calculateRULA(input));
    setActiveTool('rula');
  };

  const runSampleNIOSH = () => {
    const input: NIOSHInput = {
      actualLoadKg: 18,
      horizontalDistanceCm: 40,
      verticalDistanceCm: 50,
      verticalTravelCm: 70,
      asymmetryAngleDeg: 30,
      frequencyPerMin: 3,
      durationHours: 2,
      couplingQuality: 'fair',
    };
    setNioshResult(calculateNIOSH(input));
    setActiveTool('niosh');
  };

  const runSampleTriage = () => {
    const result = triageAssessment({
      joint: 'Shoulder',
      movement: 'Flexion',
      measuredROM: 120,
      painLevel: 7,
      workInterference: 'moderate',
      redFlagsPresent: [],
      postureRiskPersistent: true,
    });
    setTriageResult(result);
    setActiveTool('triage');
  };

  const getRiskColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('negligible') || l.includes('acceptable') || l.includes('low')) return 'bg-emerald-100 text-emerald-800';
    if (l.includes('medium') || l.includes('moderate') || l.includes('increased')) return 'bg-amber-100 text-amber-800';
    if (l.includes('high') || l.includes('very high')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-orange-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/clinical/analysis')} className="p-2 hover:bg-white rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              Ergonomic Risk Assessment Engine
            </h1>
            <p className="text-gray-500 mt-1">REBA, RULA & NIOSH RLE — Evidence-based posture and lifting risk scoring</p>
          </div>
        </div>

        {/* Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'reba', name: 'REBA', desc: 'Whole-body posture', action: runSampleREBA, color: 'from-orange-500 to-red-500' },
            { id: 'rula', name: 'RULA', desc: 'Upper-limb focused', action: runSampleRULA, color: 'from-blue-500 to-indigo-500' },
            { id: 'niosh', name: 'NIOSH RLE', desc: 'Lifting equation', action: runSampleNIOSH, color: 'from-purple-500 to-pink-500' },
            { id: 'triage', name: 'Clinical Triage', desc: 'ROM + pain referral', action: runSampleTriage, color: 'from-teal-500 to-emerald-500' },
          ].map(tool => (
            <motion.button
              key={tool.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={tool.action}
              className={`p-5 rounded-2xl text-white text-left shadow-lg bg-gradient-to-br ${tool.color} ${
                activeTool === tool.id ? 'ring-4 ring-offset-2 ring-gray-300' : ''
              }`}
            >
              <p className="text-lg font-black">{tool.name}</p>
              <p className="text-xs opacity-80 mt-1">{tool.desc}</p>
              <p className="text-[10px] mt-3 opacity-60">Click to run sample assessment</p>
            </motion.button>
          ))}
        </div>

        {/* Results */}
        {activeTool === 'reba' && rebaResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" /> REBA Assessment Result
              </h3>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${getRiskColor(rebaResult.riskLevel)}`}>
                {rebaResult.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Final Score', value: rebaResult.finalScore, max: '15' },
                { label: 'Group A', value: rebaResult.scoreA, max: '—' },
                { label: 'Group B', value: rebaResult.scoreB, max: '—' },
                { label: 'Table C', value: rebaResult.scoreC, max: '—' },
                { label: 'Action Level', value: rebaResult.finalScore <= 1 ? '0' : rebaResult.finalScore <= 3 ? '1' : rebaResult.finalScore <= 7 ? '2' : rebaResult.finalScore <= 10 ? '3' : '4', max: '4' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{item.value}</p>
                  <p className="text-[9px] text-gray-400">max {item.max}</p>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <p className="font-bold text-orange-900 text-sm">Action Required: {rebaResult.actionLevel}</p>
              <p className="text-xs text-orange-700 mt-1">Risk Level: {rebaResult.riskLevel} — Score {rebaResult.finalScore}/15</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
              <p className="font-bold mb-1">Provenance</p>
              <p>Tool: {rebaResult.provenance.tool_type} | Source: {rebaResult.provenance.source_class}</p>
              <p>Status: {rebaResult.provenance.regulatory_status}</p>
              <p className="mt-1 italic">{rebaResult.provenance.citation}</p>
            </div>
          </motion.div>
        )}

        {activeTool === 'rula' && rulaResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> RULA Assessment Result
              </h3>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                rulaResult.actionLevel <= 2 ? 'bg-emerald-100 text-emerald-800' :
                rulaResult.actionLevel === 3 ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                Action Level {rulaResult.actionLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Final Score', value: rulaResult.finalScore },
                { label: 'Arm & Wrist (A)', value: rulaResult.grandScoreA },
                { label: 'Neck & Trunk (B)', value: rulaResult.grandScoreB },
                { label: 'Action Level', value: rulaResult.actionLevel },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="font-bold text-blue-900 text-sm">{rulaResult.actionDescription}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
              <p className="font-bold mb-1">Provenance</p>
              <p className="italic">{rulaResult.provenance.citation}</p>
              <p className="mt-1">Status: {rulaResult.provenance.regulatory_status}</p>
            </div>
          </motion.div>
        )}

        {activeTool === 'niosh' && nioshResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" /> NIOSH Lifting Equation Result
              </h3>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${getRiskColor(nioshResult.riskLevel)}`}>
                {nioshResult.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">RWL (Recommended Weight Limit)</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{nioshResult.rwl} kg</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Lifting Index</p>
                <p className={`text-3xl font-black mt-1 ${nioshResult.liftingIndex <= 1 ? 'text-emerald-600' : nioshResult.liftingIndex <= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                  {nioshResult.liftingIndex}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Load Constant</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{nioshResult.multipliers.LC} kg</p>
              </div>
            </div>

            {/* Multipliers */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="font-bold text-purple-900 text-sm mb-2">Multiplier Breakdown</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(nioshResult.multipliers).filter(([k]) => k !== 'LC').map(([key, val]) => (
                  <div key={key} className="text-center">
                    <p className="text-[9px] font-bold text-purple-700 uppercase">{key}</p>
                    <p className="text-sm font-black text-gray-900">{val}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-purple-700 mt-3">Formula: RWL = LC × HM × VM × DM × AM × FM × CM = {nioshResult.rwl} kg</p>
            </div>

            <div className={`rounded-xl p-4 border ${nioshResult.liftingIndex <= 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm font-medium ${nioshResult.liftingIndex <= 1 ? 'text-emerald-800' : 'text-red-800'}`}>
                {nioshResult.riskDescription}
              </p>
            </div>

            {/* Limitations */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> Limitations
              </p>
              <ul className="space-y-1">
                {nioshResult.provenance.limitations.map((lim, i) => (
                  <li key={i} className="text-xs text-amber-800">• {lim}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
              <p className="font-bold mb-1">Provenance</p>
              <p className="italic">{nioshResult.provenance.citation}</p>
              <p className="mt-1">Status: {nioshResult.provenance.regulatory_status}</p>
            </div>
          </motion.div>
        )}

        {activeTool === 'triage' && triageResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" /> Clinical Triage Result
              </h3>
              <div className="flex items-center gap-2">
                {triageResult.referralRecommended && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Referral Recommended</span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(triageResult.urgency)}`}>
                  {triageResult.urgency}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Referral Type</p>
                <p className="text-sm font-black text-gray-900 mt-1">{triageResult.referralType}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">ROM % of Norm</p>
                <p className="text-sm font-black text-gray-900 mt-1">{triageResult.romPercentOfNorm?.toFixed(0) ?? 'N/A'}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Rule Class</p>
                <p className="text-sm font-black text-gray-900 mt-1">{triageResult.ruleClass.replace(/_/g, ' ')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Urgency</p>
                <p className="text-sm font-black text-gray-900 mt-1 capitalize">{triageResult.urgency}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <p className="font-bold text-teal-900 text-sm mb-2">Clinical Reasoning</p>
              <ul className="space-y-1">
                {triageResult.reasoning.map((r, i) => (
                  <li key={i} className="text-xs text-teal-800 flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-teal-600 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div>
              <p className="font-bold text-gray-900 text-sm mb-2">Recommended Actions</p>
              <div className="space-y-2">
                {triageResult.clinicalActions.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    <p className="text-sm text-gray-800">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Provenance */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
              <p className="font-bold mb-1">Provenance & Limitations</p>
              <p>Method: {triageResult.provenance.method}</p>
              <p>Evidence: {triageResult.provenance.evidence_basis}</p>
              <ul className="mt-2 space-y-0.5">
                {triageResult.provenance.limitations.map((l, i) => (
                  <li key={i} className="italic">• {l}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* ROM Reference Table */}
        {!activeTool && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">AAOS Standard Adult ROM Reference Values</h3>
              <p className="text-xs text-gray-500 mt-1">Source: Standard adult AAOS reference table (widely reproduced in clinical literature)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Joint</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Movement</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Normal (°)</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {AAOS_ROM_NORMS.map((norm, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{norm.joint}</td>
                      <td className="px-4 py-2 text-gray-700">{norm.movement}</td>
                      <td className="px-4 py-2 text-center font-bold text-gray-900">{norm.normalDegrees}°</td>
                      <td className="px-4 py-2 text-xs text-gray-500 italic">{norm.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
