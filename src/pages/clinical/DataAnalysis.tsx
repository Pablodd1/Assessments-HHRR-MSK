import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Sparkles,
  Stethoscope,
  Activity,
  Brain,
  Volume2,
  FileText,
  Dumbbell,
  ClipboardList,
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  User
} from 'lucide-react';

interface MovementData {
  joint: string;
  rom: number;
  symmetry: number;
  compensation: string[];
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

interface AnalysisResult {
  overallScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  movementPatterns: { pattern: string; status: 'normal' | 'compensated' | 'dysfunctional'; notes: string }[];
  asymmetries: { region: string; difference: number; clinicalSignificance: string }[];
  treatmentPriorities: string[];
  trainingFocus: string[];
}

// Sample 3D assessment data (simulating what would come from KinetSense/DARI)
const SAMPLE_3D_DATA: MovementData[] = [
  { joint: 'Cervical Spine', rom: 65, symmetry: 88, compensation: ['Forward head'], quality: 'Fair' },
  { joint: 'Shoulder Flexion (L)', rom: 170, symmetry: 92, compensation: [], quality: 'Good' },
  { joint: 'Shoulder Flexion (R)', rom: 158, symmetry: 92, compensation: ['Scapular elevation'], quality: 'Fair' },
  { joint: 'Thoracic Rotation (L)', rom: 42, symmetry: 78, compensation: ['Lumbar rotation'], quality: 'Fair' },
  { joint: 'Thoracic Rotation (R)', rom: 55, symmetry: 78, compensation: [], quality: 'Good' },
  { joint: 'Hip Flexion (L)', rom: 115, symmetry: 95, compensation: [], quality: 'Excellent' },
  { joint: 'Hip Flexion (R)', rom: 110, symmetry: 95, compensation: ['Posterior pelvic tilt'], quality: 'Good' },
  { joint: 'Knee Flexion (L)', rom: 135, symmetry: 97, compensation: [], quality: 'Excellent' },
  { joint: 'Knee Flexion (R)', rom: 130, symmetry: 97, compensation: [], quality: 'Good' },
  { joint: 'Ankle Dorsiflexion (L)', rom: 18, symmetry: 85, compensation: ['Knee valgus'], quality: 'Fair' },
  { joint: 'Ankle Dorsiflexion (R)', rom: 22, symmetry: 85, compensation: [], quality: 'Good' },
  { joint: 'Squat Depth', rom: 95, symmetry: 90, compensation: ['Heel rise', 'Forward lean'], quality: 'Fair' },
];

const SAMPLE_ANALYSIS: AnalysisResult = {
  overallScore: 68,
  riskLevel: 'Moderate',
  movementPatterns: [
    { pattern: 'Overhead Reach', status: 'compensated', notes: 'R shoulder compensates with scapular elevation - possible rotator cuff weakness' },
    { pattern: 'Deep Squat', status: 'compensated', notes: 'Bilateral heel rise + forward lean indicating ankle mobility restriction' },
    { pattern: 'Single Leg Balance', status: 'normal', notes: 'Adequate stability both sides, minor hip drop R side' },
    { pattern: 'Trunk Rotation', status: 'dysfunctional', notes: 'Significant L thoracic limitation with lumbar compensation - injury risk' },
    { pattern: 'Hip Hinge', status: 'normal', notes: 'Good pattern, adequate hamstring length bilaterally' },
  ],
  asymmetries: [
    { region: 'Thoracic Rotation', difference: 13, clinicalSignificance: 'Clinically significant (>10°) - increased injury risk for rotational sports/activities' },
    { region: 'Shoulder Flexion', difference: 12, clinicalSignificance: 'Moderate asymmetry - may indicate R rotator cuff or capsular restriction' },
    { region: 'Ankle Dorsiflexion', difference: 4, clinicalSignificance: 'Within normal limits but monitor - can affect squat mechanics' },
  ],
  treatmentPriorities: [
    'Thoracic spine mobilization (Grade III-IV PA glides T4-T8)',
    'Right rotator cuff strengthening (external rotation focus)',
    'Bilateral ankle dorsiflexion mobilization (talocrural joint)',
    'Cervical retraction exercises for forward head posture',
    'Core anti-rotation stability training',
  ],
  trainingFocus: [
    'Thoracic rotation mobility drills (open books, thread-the-needle)',
    'Scapular stability: wall slides, prone Y-T-W',
    'Ankle mobility: weighted dorsiflexion stretches, calf eccentrics',
    'Squat progression: heel-elevated goblet squats → full depth',
    'Anti-rotation pallof press variations',
  ]
};

export const ClinicalDataAnalysis = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'data' | 'treatment' | 'training' | 'voice'>('data');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(true); // Start with sample data
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalysis(true);
    }, 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-600 bg-emerald-100';
      case 'Moderate': return 'text-amber-600 bg-amber-100';
      case 'High': return 'text-red-600 bg-red-100';
      case 'Critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'bg-emerald-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-amber-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-teal-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl">
                  <Activity className="w-6 h-6 text-teal-600" />
                </div>
                Clinical Data Analysis
              </h1>
              <p className="text-gray-500 mt-1">Parse 3D assessment data → Generate treatment plans + training programs with voice explanations</p>
            </div>
          </div>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 transition-all shadow-sm"
          >
            {isAnalyzing ? (
              <><Brain className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Run AI Analysis</>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex gap-1">
          {[
            { id: 'data', label: 'Raw Data & Patterns', icon: BarChart3 },
            { id: 'treatment', label: 'Treatment Plan (PT/MD)', icon: Stethoscope },
            { id: 'training', label: 'Training Program (Coach)', icon: Dumbbell },
            { id: 'voice', label: 'Voice Reports', icon: Volume2 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Mobility Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-gray-900">{SAMPLE_ANALYSIS.overallScore}</span>
                  <span className="text-lg text-gray-400 mb-1">/100</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Risk Level</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${getRiskColor(SAMPLE_ANALYSIS.riskLevel)}`}>
                  {SAMPLE_ANALYSIS.riskLevel}
                </span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Asymmetries Found</p>
                <span className="text-4xl font-black text-amber-600">{SAMPLE_ANALYSIS.asymmetries.length}</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Compensations</p>
                <span className="text-4xl font-black text-red-600">
                  {SAMPLE_3D_DATA.reduce((acc, d) => acc + d.compensation.length, 0)}
                </span>
              </div>
            </div>

            {/* Joint ROM Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  3D Assessment Data — Joint Range of Motion
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Joint/Movement</th>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-center">ROM (°)</th>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-center">Symmetry %</th>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-center">Quality</th>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Compensations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SAMPLE_3D_DATA.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.joint}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-sm font-bold text-gray-900">{item.rom}°</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${item.symmetry >= 90 ? 'bg-emerald-500' : item.symmetry >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${item.symmetry}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-600">{item.symmetry}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${getQualityColor(item.quality)} mr-1`} />
                          <span className="text-xs font-semibold text-gray-700">{item.quality}</span>
                        </td>
                        <td className="px-5 py-3">
                          {item.compensation.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.compensation.map(c => (
                                <span key={c} className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{c}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Movement Pattern Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                Movement Pattern Analysis
              </h3>
              <div className="space-y-3">
                {SAMPLE_ANALYSIS.movementPatterns.map((mp, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    mp.status === 'normal' ? 'border-emerald-200 bg-emerald-50' :
                    mp.status === 'compensated' ? 'border-amber-200 bg-amber-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{mp.pattern}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        mp.status === 'normal' ? 'bg-emerald-600 text-white' :
                        mp.status === 'compensated' ? 'bg-amber-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>{mp.status}</span>
                    </div>
                    <p className="text-xs text-gray-700">{mp.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Asymmetries */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Significant Asymmetries
              </h3>
              <div className="space-y-3">
                {SAMPLE_ANALYSIS.asymmetries.map((asym, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-900">{asym.region}</span>
                      <span className="text-lg font-black text-amber-600">{asym.difference}° difference</span>
                    </div>
                    <p className="text-xs text-gray-600">{asym.clinicalSignificance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-teal-600" />
                  Treatment Plan — Physical Therapy / Medical
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold">PT View</button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">MD View</button>
                </div>
              </div>

              {/* Patient Summary */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-5 mb-6 border border-teal-100">
                <h4 className="font-bold text-teal-900 mb-3">Clinical Summary</h4>
                <p className="text-sm text-teal-800 leading-relaxed">
                  Patient presents with moderate movement dysfunction (score: 68/100). Primary findings include significant 
                  left thoracic rotation restriction with lumbar compensation pattern, right shoulder mobility limitation with 
                  scapular compensation, and bilateral ankle dorsiflexion restriction affecting squat mechanics. 
                  Asymmetry index is clinically significant for thoracic rotation (13° difference) warranting targeted intervention.
                </p>
              </div>

              {/* Treatment Priorities */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Treatment Priorities (Ordered)</h4>
                <div className="space-y-2">
                  {SAMPLE_ANALYSIS.treatmentPriorities.map((tp, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 transition-colors"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center text-xs font-black text-teal-700">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-800 pt-1">{tp}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Frequency & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Recommended Frequency</p>
                  <p className="text-lg font-bold text-gray-900">2-3x per week</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Treatment Duration</p>
                  <p className="text-lg font-bold text-gray-900">6-8 weeks</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Re-assessment</p>
                  <p className="text-lg font-bold text-gray-900">4 weeks</p>
                </div>
              </div>

              {/* Precautions */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Precautions & Contraindications
                </h4>
                <ul className="space-y-1 text-xs text-red-700">
                  <li>• Avoid end-range lumbar rotation during thoracic mobilization</li>
                  <li>• Monitor for shoulder impingement symptoms during overhead work</li>
                  <li>• Progress ankle mobility gradually — assess subtalar joint stability</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-indigo-600" />
                  Training Program — Strength & Conditioning Coach
                </h3>
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">Phase 1: Corrective</span>
              </div>

              {/* Training Focus Areas */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Priority Training Focus</h4>
                <div className="space-y-3">
                  {SAMPLE_ANALYSIS.trainingFocus.map((tf, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">
                        {i + 1}
                      </span>
                      <div className="pt-1">
                        <p className="text-sm font-medium text-gray-800">{tf}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sample Week */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Sample Week Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { day: 'Day 1', focus: 'Mobility + Activation', exercises: ['Thoracic foam roll', 'Open books 3×10', 'Wall slides 3×12', 'Pallof press 3×10'] },
                    { day: 'Day 2', focus: 'Strength + Stability', exercises: ['Goblet squat (elevated) 3×10', 'SA row 3×12', 'RDL 3×10', 'Plank variations 3×30s'] },
                    { day: 'Day 3', focus: 'Integration + Power', exercises: ['Squat progression 4×8', 'Push-pull supersets', 'Anti-rotation chops 3×10', 'Loaded carries 3×40m'] },
                  ].map((day, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="font-bold text-indigo-600 text-sm mb-1">{day.day}</p>
                      <p className="text-xs text-gray-500 mb-3">{day.focus}</p>
                      <ul className="space-y-1.5">
                        {day.exercises.map((ex, j) => (
                          <li key={j} className="text-xs text-gray-700 flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progression Criteria */}
              <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progression Criteria (Move to Phase 2 when):
                </h4>
                <ul className="space-y-1 text-xs text-emerald-700">
                  <li>• Thoracic rotation symmetry reaches ≥ 85%</li>
                  <li>• Full depth squat without heel rise (bodyweight)</li>
                  <li>• Shoulder flexion symmetry ≥ 90%</li>
                  <li>• No compensation patterns during loaded movements</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-6">
            {/* Voice Reports for Each Stakeholder */}
            {[
              {
                role: 'Patient',
                icon: User,
                color: 'from-blue-500 to-cyan-600',
                transcript: `Hi there! Here's a plain-language summary of your movement assessment. Your overall mobility score is 68 out of 100, which puts you in the moderate range. The main areas we want to work on are your upper back rotation — especially on the left side — your right shoulder flexibility, and your ankle mobility. These findings explain why you might feel stiff when reaching overhead or squatting down. The good news is that these are all very correctable with targeted exercises. Your physical therapist will focus on mobilizing your upper back and improving your shoulder mechanics, while your training program will include specific drills to improve your squat depth and overhead reach. We recommend 2-3 sessions per week for about 6-8 weeks, and we'll re-test at the 4-week mark to track your progress.`
              },
              {
                role: 'Coach / Trainer',
                icon: Dumbbell,
                color: 'from-indigo-500 to-purple-600',
                transcript: `Coach's briefing: This client has a mobility score of 68 with three key movement restrictions to program around. First, limited left thoracic rotation with lumbar compensation — avoid loaded rotational movements until mobility improves. Use open books and thread-the-needle as warm-up priority. Second, right shoulder has 12 degrees less flexion with scapular elevation compensation — program wall slides and prone Y-T-W before any overhead pressing. Third, bilateral ankle dorsiflexion restriction causing heel rise and forward lean in squats — use heel-elevated squats as regression and add weighted ankle stretches. Progression criteria: move to phase 2 when thoracic symmetry hits 85% and they can hit full-depth bodyweight squat without heel rise. Re-assess at 4 weeks.`
              },
              {
                role: 'Doctor / Physical Therapist',
                icon: Stethoscope,
                color: 'from-teal-500 to-emerald-600',
                transcript: `Clinical summary: 68/100 overall mobility with moderate risk classification. Primary findings: 1) Left thoracic rotation restriction at 42 degrees versus 55 degrees right, with compensatory lumbar rotation pattern — recommend Grade III-IV PA mobilizations T4-T8, reassess segmental mobility. 2) Right shoulder flexion limited to 158 degrees with scapular elevation compensation suggesting possible supraspinatus or capsular restriction — consider impingement special testing if no improvement in 2 weeks. 3) Bilateral ankle dorsiflexion restriction (L18°, R22°) with knee valgus compensation on left — assess talocrural joint mobility and gastrocnemius-soleus complex length. Precautions: avoid end-range lumbar rotation during thoracic mobilization, monitor for shoulder impingement symptoms. Recommended frequency 2-3x/week, duration 6-8 weeks, reassess at 4 weeks.`
              }
            ].map((report, i) => {
              const Icon = report.icon;
              return (
                <motion.div
                  key={report.role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className={`p-5 bg-gradient-to-r ${report.color} flex items-center justify-between`}>
                    <div className="flex items-center gap-3 text-white">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-bold">Voice Report — {report.role}</h3>
                    </div>
                    <button
                      onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                      className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-semibold hover:bg-white/30 transition-all"
                    >
                      {isPlayingVoice ? (
                        <><Volume2 className="w-4 h-4 mr-2 animate-pulse" /> Playing...</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" /> Play Audio</>
                      )}
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Transcript</p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">"{report.transcript}"</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
