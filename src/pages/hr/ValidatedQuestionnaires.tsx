import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Brain,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  BarChart3,
  Info
} from 'lucide-react';
import {
  scoreGAD7,
  scoreDASS21,
  scorePHQ9,
  combinedMentalHealthRisk,
  GAD7_QUESTIONS,
  GAD7_RESPONSE_OPTIONS,
  DASS21_DEPRESSION_ITEMS,
  DASS21_ANXIETY_ITEMS,
  DASS21_STRESS_ITEMS,
  DASS21_RESPONSE_OPTIONS,
  PHQ9_QUESTIONS,
  PHQ9_RESPONSE_OPTIONS,
  type GAD7Response,
  type DASS21Response,
  type PHQ9Response,
  type CombinedMentalHealthResult,
} from '../../lib/rag/clinicalQuestionnaires';

type InstrumentType = 'gad7' | 'dass21' | 'phq9';

export const ValidatedQuestionnaires = () => {
  const navigate = useNavigate();
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CombinedMentalHealthResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const instruments = [
    {
      id: 'gad7' as InstrumentType,
      name: 'GAD-7',
      fullName: 'Generalized Anxiety Disorder 7-Item Scale',
      description: 'Validated anxiety screening instrument',
      items: 7,
      time: '2-3 min',
      license: 'No permission required',
      color: 'from-violet-500 to-purple-600',
      icon: Brain,
      sensitivity: '89%',
      specificity: '82%',
    },
    {
      id: 'phq9' as InstrumentType,
      name: 'PHQ-9',
      fullName: 'Patient Health Questionnaire - 9',
      description: 'Validated depression severity measure',
      items: 9,
      time: '3-5 min',
      license: 'No-fee, preserve official wording',
      color: 'from-blue-500 to-cyan-600',
      icon: Heart,
      sensitivity: '88%',
      specificity: '88%',
    },
    {
      id: 'dass21' as InstrumentType,
      name: 'DASS-21',
      fullName: 'Depression Anxiety Stress Scales - 21 Item',
      description: 'Public domain symptom severity instrument',
      items: 21,
      time: '5-8 min',
      license: 'Public domain (UNSW)',
      color: 'from-teal-500 to-emerald-600',
      icon: Activity,
      sensitivity: 'Multi-scale',
      specificity: 'Severity measure',
    },
  ];

  const getQuestions = () => {
    switch (selectedInstrument) {
      case 'gad7': return GAD7_QUESTIONS.map(q => ({ id: q.id, text: q.text }));
      case 'phq9': return PHQ9_QUESTIONS.map(q => ({ id: q.id, text: q.text }));
      case 'dass21': return [
        ...DASS21_STRESS_ITEMS.map(q => ({ id: q.id, text: q.text, subscale: 'Stress' })),
        ...DASS21_ANXIETY_ITEMS.map(q => ({ id: q.id, text: q.text, subscale: 'Anxiety' })),
        ...DASS21_DEPRESSION_ITEMS.map(q => ({ id: q.id, text: q.text, subscale: 'Depression' })),
      ];
      default: return [];
    }
  };

  const getResponseOptions = () => {
    switch (selectedInstrument) {
      case 'gad7': return GAD7_RESPONSE_OPTIONS;
      case 'phq9': return PHQ9_RESPONSE_OPTIONS;
      case 'dass21': return DASS21_RESPONSE_OPTIONS;
      default: return [];
    }
  };

  const questions = getQuestions();
  const options = getResponseOptions();

  const handleResponse = (value: number) => {
    const q = questions[currentQuestion];
    setResponses(prev => ({ ...prev, [q.id]: value }));

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 200);
    }
  };

  const calculateResults = () => {
    let combinedResult: CombinedMentalHealthResult;

    if (selectedInstrument === 'gad7') {
      const gad7Resp: GAD7Response = {
        nervousAnxious: (responses['nervousAnxious'] ?? 0) as 0 | 1 | 2 | 3,
        cantStopWorrying: (responses['cantStopWorrying'] ?? 0) as 0 | 1 | 2 | 3,
        worryingTooMuch: (responses['worryingTooMuch'] ?? 0) as 0 | 1 | 2 | 3,
        troubleRelaxing: (responses['troubleRelaxing'] ?? 0) as 0 | 1 | 2 | 3,
        restless: (responses['restless'] ?? 0) as 0 | 1 | 2 | 3,
        easilyAnnoyed: (responses['easilyAnnoyed'] ?? 0) as 0 | 1 | 2 | 3,
        afraidSomethingAwful: (responses['afraidSomethingAwful'] ?? 0) as 0 | 1 | 2 | 3,
      };
      const gad7Result = scoreGAD7(gad7Resp);
      combinedResult = combinedMentalHealthRisk(gad7Result, undefined, undefined);
    } else if (selectedInstrument === 'phq9') {
      const phq9Resp: PHQ9Response = {
        littleInterest: (responses['littleInterest'] ?? 0) as 0 | 1 | 2 | 3,
        feelingDown: (responses['feelingDown'] ?? 0) as 0 | 1 | 2 | 3,
        sleepProblems: (responses['sleepProblems'] ?? 0) as 0 | 1 | 2 | 3,
        tiredNoEnergy: (responses['tiredNoEnergy'] ?? 0) as 0 | 1 | 2 | 3,
        poorAppetite: (responses['poorAppetite'] ?? 0) as 0 | 1 | 2 | 3,
        feelingBadAboutSelf: (responses['feelingBadAboutSelf'] ?? 0) as 0 | 1 | 2 | 3,
        troubleConcentrating: (responses['troubleConcentrating'] ?? 0) as 0 | 1 | 2 | 3,
        movingSlowly: (responses['movingSlowly'] ?? 0) as 0 | 1 | 2 | 3,
        thoughtsSelfHarm: (responses['thoughtsSelfHarm'] ?? 0) as 0 | 1 | 2 | 3,
      };
      const phq9Result = scorePHQ9(phq9Resp);
      combinedResult = combinedMentalHealthRisk(undefined, undefined, phq9Result);
    } else {
      // DASS-21
      const stressVals = DASS21_STRESS_ITEMS.map(q => responses[q.id] ?? 0);
      const anxVals = DASS21_ANXIETY_ITEMS.map(q => responses[q.id] ?? 0);
      const depVals = DASS21_DEPRESSION_ITEMS.map(q => responses[q.id] ?? 0);
      const dass21Resp: DASS21Response = {
        stress: stressVals as [number, number, number, number, number, number, number],
        anxiety: anxVals as [number, number, number, number, number, number, number],
        depression: depVals as [number, number, number, number, number, number, number],
      };
      const dass21Result = scoreDASS21(dass21Resp);
      combinedResult = combinedMentalHealthRisk(undefined, dass21Result, undefined);
    }

    setResult(combinedResult);
    setShowResult(true);
  };

  const resetAssessment = () => {
    setSelectedInstrument(null);
    setCurrentQuestion(0);
    setResponses({});
    setResult(null);
    setShowResult(false);
  };

  const getSeverityColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-600 bg-emerald-100';
      case 'Moderate': return 'text-amber-600 bg-amber-100';
      case 'High': return 'text-red-600 bg-red-100';
      case 'Critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // ─── Instrument Selection View ───
  if (!selectedInstrument) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-violet-50/20 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hr/assessment')} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <Brain className="w-6 h-6 text-violet-600" />
                </div>
                Validated Clinical Questionnaires
              </h1>
              <p className="text-gray-500 mt-1">Evidence-based mental health screening instruments with validated scoring</p>
            </div>
          </div>

          {/* Licensing Notice */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-bold mb-1">Instrument Licensing</p>
              <p>All instruments below are validated, peer-reviewed tools with clear no-fee licensing for clinical use. Official wording is preserved per licensing requirements. These are <strong>symptom severity measures</strong>, not stand-alone diagnostic tools.</p>
            </div>
          </div>

          {/* Instrument Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instruments.map((inst) => {
              const Icon = inst.icon;
              return (
                <motion.div
                  key={inst.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedInstrument(inst.id)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${inst.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{inst.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{inst.fullName}</p>
                  <p className="text-sm text-gray-600 mb-4">{inst.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Items</span>
                      <span className="font-bold text-gray-700">{inst.items} questions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-bold text-gray-700">{inst.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sensitivity</span>
                      <span className="font-bold text-gray-700">{inst.sensitivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">License</span>
                      <span className="font-bold text-emerald-600">{inst.license}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                    Start Assessment →
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Results View ───
  if (showResult && result) {
    const instrument = instruments.find(i => i.id === selectedInstrument)!;
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-violet-50/20 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={resetAssessment} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{instrument.name} Results</h1>
              <p className="text-gray-500 text-sm">Validated scoring with clinical action recommendations</p>
            </div>
          </div>

          {/* Risk Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 text-center ${
              result.compositeRisk === 'Critical' ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' :
              result.compositeRisk === 'High' ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' :
              result.compositeRisk === 'Moderate' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
              'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
            }`}
          >
            <p className="text-sm font-bold uppercase tracking-wider opacity-80">Composite Risk Level</p>
            <p className="text-5xl font-black mt-2">{result.compositeRisk}</p>
            {result.gad7 && <p className="mt-2 opacity-80">GAD-7 Score: {result.gad7.totalScore}/21 — {result.gad7.severity}</p>}
            {result.phq9 && <p className="mt-2 opacity-80">PHQ-9 Score: {result.phq9.totalScore}/27 — {result.phq9.severity}</p>}
            {result.dass21 && (
              <p className="mt-2 opacity-80">
                DASS-21: Depression {result.dass21.depression.severity} | Anxiety {result.dass21.anxiety.severity} | Stress {result.dass21.stress.severity}
              </p>
            )}
          </motion.div>

          {/* Safety Flag */}
          {result.phq9?.suicidalIdeationFlag && (
            <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-black text-red-800 text-lg">SAFETY FLAG — Suicidal Ideation Endorsed</p>
                <p className="text-sm text-red-700 mt-1">Patient endorsed thoughts of self-harm (Item 9). Immediate safety assessment required per clinical protocol.</p>
              </div>
            </div>
          )}

          {/* Clinical Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Recommended Clinical Actions
            </h3>
            <div className="space-y-2">
              {result.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800">{action}</p>
                </div>
              ))}
              {result.gad7 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-700">{result.gad7.clinicalAction}</p>
                </div>
              )}
              {result.phq9 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-700">{result.phq9.clinicalAction}</p>
                </div>
              )}
              {result.dass21 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-700">{result.dass21.clinicalAction}</p>
                </div>
              )}
            </div>
          </div>

          {/* Workplace Implications */}
          {result.workplaceImplications.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="font-bold text-amber-900 mb-3">Workplace Implications</h3>
              <ul className="space-y-2">
                {result.workplaceImplications.map((imp, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Provenance */}
          <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-600">
            <p className="font-bold mb-1">Provenance & Validation</p>
            {result.gad7 && <p>• {result.gad7.provenance.citation}</p>}
            {result.phq9 && <p>• {result.phq9.provenance.citation}</p>}
            {result.dass21 && <p>• {result.dass21.provenance.citation}</p>}
            <p className="mt-2 italic">Note: These instruments measure symptom severity and are not stand-alone diagnostic tools. Clinical judgment required.</p>
          </div>

          <button onClick={resetAssessment} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Start Another Assessment
          </button>
        </div>
      </div>
    );
  }

  // ─── Questionnaire View ───
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const allAnswered = questions.every(q => responses[q.id] !== undefined);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-violet-50/20 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header with progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={resetAssessment} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="font-bold text-gray-900">{instruments.find(i => i.id === selectedInstrument)?.name}</h2>
              <p className="text-xs text-gray-500">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
          >
            {/* DASS-21 subscale indicator */}
            {'subscale' in (currentQ as any) && (
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-4">
                {(currentQ as any).subscale} Subscale
              </span>
            )}

            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              {selectedInstrument === 'dass21' ? 'Over the past week...' : 'Over the last 2 weeks, how often have you been bothered by:'}
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-8">
              {currentQ.text}
            </h3>

            {/* Response Options */}
            <div className="space-y-3">
              {options.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleResponse(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    responses[currentQ.id] === opt.value
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      responses[currentQ.id] === opt.value ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {responses[currentQ.id] === opt.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-400 ml-2">({opt.value})</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>

          {allAnswered ? (
            <button
              onClick={calculateResults}
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" /> Calculate Results
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
