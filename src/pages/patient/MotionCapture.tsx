import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  Camera,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Activity,
  X,
  User,
  RotateCcw
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface MovementTestResult {
  score: number;
  symmetry: number;
  compensations: string[];
}

interface MovementTest {
  id: string;
  name: string;
  description: string;
  duration: number;
  keypoints: string[];
}

interface ScoreBucket {
  scoreMin: number;
  scoreRange: number;
  symMin: number;
  symRange: number;
  compensations: string[];
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const MOVEMENT_TESTS: MovementTest[] = [
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    description: 'Stand with feet shoulder-width apart, squat down as low as comfortable, and return to standing',
    duration: 5,
    keypoints: ['knees', 'hips', 'ankles', 'spine']
  },
  {
    id: 'overhead_reach',
    name: 'Overhead Reach',
    description: 'Raise both arms overhead and hold for the countdown — keep your back straight',
    duration: 4,
    keypoints: ['shoulders', 'spine', 'hips']
  },
  {
    id: 'gait',
    name: 'Walking Gait',
    description: 'Walk naturally in place — we will analyze your step pattern and balance',
    duration: 10,
    keypoints: ['knees', 'ankles', 'hips']
  }
];

// Score buckets keyed by test id — each test gets a different profile
const SCORE_BUCKETS: Record<string, ScoreBucket> = {
  squat:          { scoreMin: 52, scoreRange: 38, symMin: 55, symRange: 35, compensations: ['Knee valgus', 'Forward trunk lean', 'Heel rise premature'] },
  overhead_reach: { scoreMin: 60, scoreRange: 30, symMin: 68, symRange: 28, compensations: ['Limited bilateral elevation', 'Scapular winging'] },
  gait:           { scoreMin: 48, scoreRange: 40, symMin: 52, symRange: 38, compensations: ['Antalgic left stride', 'Reduced arm swing'] }
};

const BODY_KEYPOINTS = [
  { id: 'head',         x: 50, y: 8  },
  { id: 'neck',         x: 50, y: 15 },
  { id: 'left_shoulder',x: 35, y: 22 },
  { id: 'right_shoulder',x: 65, y: 22 },
  { id: 'left_elbow',   x: 25, y: 35 },
  { id: 'right_elbow',  x: 75, y: 35 },
  { id: 'left_wrist',   x: 20, y: 48 },
  { id: 'right_wrist',  x: 80, y: 48 },
  { id: 'left_hip',     x: 42, y: 48 },
  { id: 'right_hip',    x: 58, y: 48 },
  { id: 'left_knee',    x: 40, y: 65 },
  { id: 'right_knee',   x: 60, y: 65 },
  { id: 'left_ankle',   x: 39, y: 82 },
  { id: 'right_ankle',  x: 61, y: 82 }
];

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const generateResult = (testId: string): MovementTestResult => {
  const bucket = SCORE_BUCKETS[testId];
  const score     = Math.round(bucket.scoreMin + Math.random() * bucket.scoreRange);
  const symmetry  = Math.round(bucket.symMin  + Math.random() * bucket.symRange);
  // Randomly include 0–2 compensations
  const compCount = Math.floor(Math.random() * 3);
  const compensations = bucket.compensations
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, compCount);
  return { score: Math.min(98, score), symmetry: Math.min(99, symmetry), compensations };
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const MotionCapture = () => {
  const navigate  = useNavigate();
  const { currentUser, addClinicalAssessment, employees } = useDemo();

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step,            setStep]            = useState<1 | 2 | 3>(1);
  const [cameraPermission,setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [currentTest,     setCurrentTest]     = useState(0);
  const [testStarted,     setTestStarted]     = useState(false);
  const [countdown,       setCountdown]       = useState<number | null>(null);
  const [testResults,     setTestResults]     = useState<Record<string, MovementTestResult>>({});
  const [resultId]        = useState(() => `mot-${Date.now()}`);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // ── Computed ──
  const overallScore     = useMemo(() => {
    const results = Object.values(testResults);
    if (results.length === 0) return 0;
    return Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  }, [testResults]);

  const asymmetryIndex    = useMemo(() => {
    const results = Object.values(testResults);
    if (results.length === 0) return 0;
    const avgSym = results.reduce((a, r) => a + r.symmetry, 0) / results.length;
    return Math.round(100 - avgSym);
  }, [testResults]);

  const completedCount    = Object.keys(testResults).length;
  const currentTestData   = MOVEMENT_TESTS[currentTest];
  const currentResult     = testResults[currentTestData?.id];
  const allTestsComplete  = completedCount === MOVEMENT_TESTS.length;

  // ── Handlers ──
  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraPermission('granted');
    } catch {
      setCameraPermission('denied');
    }
  }, []);

  const startTest = useCallback(async () => {
    if (!currentTestData) return;
    setTestStarted(true);

    // Countdown
    for (let i = currentTestData.duration; i >= 1; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 1000));
    }
    setCountdown(null);

    // Recording window
    await new Promise(r => setTimeout(r, 1200));

    // Capture frame
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width  = videoRef.current.videoWidth  || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      ctx?.drawImage(videoRef.current, 0, 0);
    }

    // Generate result (randomized per test id)
    const result = generateResult(currentTestData.id);
    setTestResults(prev => ({ ...prev, [currentTestData.id]: result }));
    setTestStarted(false);
  }, [currentTestData]);

  const nextTest = useCallback(() => {
    if (currentTest < MOVEMENT_TESTS.length - 1) {
      setCurrentTest(prev => prev + 1);
    } else {
      setStep(3);
    }
  }, [currentTest]);

  const handleSubmit = useCallback(async () => {
    if (!currentUser?.employeeId) return;
    const employee = employees.find(e => e.id === currentUser.employeeId);
    const now = new Date().toISOString();

    addClinicalAssessment(currentUser.employeeId, {
      id: `ca-${Date.now()}`,
      employeeId: currentUser.employeeId,
      assessmentDate: now,
      assessorName: 'Self-Assessment — Motion Capture',
      type: '3D_MOTION',
      motionData: {
        id: resultId,
        employeeId: currentUser.employeeId,
        assessmentDate: now,
        movementTests: MOVEMENT_TESTS.map(t => ({
          name: t.name,
          symmetryScore: testResults[t.id]?.symmetry ?? 0,
          romDegrees: testResults[t.id]?.score ?? 0,
          compensations: testResults[t.id]?.compensations ?? []
        })),
        overallMobilityScore: overallScore,
        asymmetryIndex,
        aiAnalysis: 'AI-powered motion analysis complete. Movement patterns analyzed for biomechanical efficiency.',
        riskFlags: Object.entries(testResults)
          .filter(([_, r]) => r.compensations.length > 0)
          .flatMap(([testId, r]) => r.compensations)
      },
      clinicalNotes: `Overall mobility: ${overallScore}/100, Asymmetry: ${asymmetryIndex}%`,
      aiSummary: `Motion capture assessment complete. Mobility score ${overallScore}/100 with ${asymmetryIndex}% asymmetry.`,
      recommendedPrograms: asymmetryIndex > 15
        ? ['Gait Correction Program', 'Bilateral Strength Training']
        : ['Mobility Maintenance Program'],
      status: 'completed'
    });

    navigate(`/results/${resultId}`);
  }, [currentUser, employees, testResults, overallScore, asymmetryIndex, addClinicalAssessment, navigate, resultId]);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/assessment')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <ScanLine className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">3D Motion Assessment</h1>
              <p className="text-xs text-slate-500">
                {step === 1 && 'Camera Setup'}
                {step === 2 && `Test ${currentTest + 1} of ${MOVEMENT_TESTS.length} — ${currentTestData?.name}`}
                {step === 3 && 'Analysis Complete'}
              </p>
            </div>
          </div>

          {step === 2 && (
            <div className="flex gap-2">
              {MOVEMENT_TESTS.map((t, i) => (
                <div
                  key={t.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                    testResults[t.id]
                      ? 'bg-emerald-500 text-white'
                      : i === currentTest
                      ? 'bg-emerald-200 text-emerald-700 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {testResults[t.id] ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-4xl mx-auto p-6">

        {/* ── STEP 1: Camera Setup ── */}
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
              <h2 className="text-xl font-bold text-slate-900 mb-1">Camera Setup</h2>
              <p className="text-sm text-slate-500 mb-6">
                Position yourself so your full body is visible. Use a well-lit area and stand about 6 feet from the camera.
              </p>

              {/* Permission states */}
              {cameraPermission === 'pending' && (
                <div className="text-center py-14">
                  <div className="w-20 h-20 mx-auto mb-5 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Camera className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Camera Access Required</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                    We'll use your camera to capture movement patterns for AI analysis.
                    No video is stored — all processing happens locally on your device.
                  </p>
                  <button
                    onClick={requestCamera}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {cameraPermission === 'denied' && (
                <div className="text-center py-14">
                  <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-400" />
                  <h3 className="font-bold text-slate-900 mb-2">Camera Access Denied</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                    Please enable camera access in your browser settings, then reload the page.
                  </p>
                  <button
                    onClick={() => navigate('/assessment')}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50"
                  >
                    Go Back
                  </button>
                </div>
              )}

              {cameraPermission === 'granted' && (
                <>
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />

                    {/* Skeleton overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="absolute inset-0 w-full h-full opacity-25">
                        <line x1="50%" y1="15%" x2="50%" y2="48%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                        <line x1="35%" y1="22%" x2="20%" y2="48%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                        <line x1="65%" y1="22%" x2="80%" y2="48%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                        <line x1="42%" y1="48%" x2="39%" y2="82%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                        <line x1="58%" y1="48%" x2="61%" y2="82%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                        {BODY_KEYPOINTS.map(kp => (
                          <circle key={kp.id} cx={`${kp.x}%`} cy={`${kp.y}%`} r="3" fill="#22C55E" opacity="0.7" />
                        ))}
                      </svg>
                      <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white text-xs p-3 rounded-xl text-center">
                        Ensure full body is visible — head to toes
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Camera ready — you can proceed when positioned
                  </div>
                </>
              )}
            </div>

            {cameraPermission === 'granted' && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center hover:bg-emerald-700 transition-colors"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Movement Tests ── */}
        {step === 2 && currentTestData && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Test Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {/* Test header */}
              <div className="flex items-center justify-between mb-1">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  Test {currentTest + 1} of {MOVEMENT_TESTS.length}
                </span>
                <span className="text-xs text-slate-500">{currentTestData.duration}s test</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{currentTestData.name}</h3>
              <p className="text-slate-600 text-sm mb-5">{currentTestData.description}</p>

              {/* Video + Overlays */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video mb-5">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

                {/* Recording skeleton */}
                <AnimatePresence>
                  {testStarted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="35%" y1="22%" x2="25%" y2="35%" stroke="#F59E0B" strokeWidth="3" opacity="0.8" />
                        <line x1="65%" y1="22%" x2="75%" y2="35%" stroke="#F59E0B" strokeWidth="3" opacity="0.8" />
                        <line x1="50%" y1="15%" x2="50%" y2="22%" stroke="#F59E0B" strokeWidth="3" opacity="0.8" />
                      </svg>
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                      >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        REC
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Countdown */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      key={countdown}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60"
                    >
                      <span className="text-9xl font-black text-white">{countdown}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result overlay */}
                <AnimatePresence>
                  {currentResult && !testStarted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/75"
                    >
                      <div className="text-center">
                        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                        <p className="text-white text-2xl font-bold">
                          Score: {currentResult.score}<span className="text-slate-400 text-lg">/100</span>
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          Symmetry: {currentResult.symmetry}%
                        </p>
                        {currentResult.compensations.length > 0 && (
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {currentResult.compensations.map(c => (
                              <span key={c} className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-xs rounded-full font-medium">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex justify-between">
                <button
                  onClick={() => { setStep(1); setCurrentTest(0); setTestResults({}); }}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-sm flex items-center hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </button>

                {!currentResult ? (
                  <button
                    onClick={startTest}
                    disabled={testStarted}
                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {testStarted ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Start Test
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextTest}
                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    {allTestsComplete ? (
                      <>View Results <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>Next Test <ChevronRight className="w-4 h-4 ml-2" /></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Test Progress Dots */}
            <div className="flex gap-2">
              {MOVEMENT_TESTS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { if (testResults[t.id]) { setCurrentTest(i); } }}
                  disabled={!testResults[t.id]}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    testResults[t.id] ? 'bg-emerald-500' :
                    i === currentTest ? 'bg-emerald-300' : 'bg-slate-200'
                  } ${!testResults[t.id] ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                />
              ))}
            </div>
            <p className="text-center text-xs text-slate-400">
              {completedCount}/{MOVEMENT_TESTS.length} tests complete
            </p>
          </motion.div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Hero */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center shadow-xl">
              <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-emerald-300" />
              <h2 className="text-3xl font-black mb-1">Assessment Complete</h2>
              <p className="text-emerald-100 text-sm">Your 3D motion analysis is ready</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Overall Mobility</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{overallScore}</span>
                  <span className="text-slate-400 text-lg">/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      overallScore >= 70 ? 'bg-emerald-500' : overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {overallScore >= 70 ? 'Good mobility' : overallScore >= 50 ? 'Moderate — room for improvement' : 'Below average — intervention recommended'}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Asymmetry Index</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{asymmetryIndex}</span>
                  <span className="text-slate-400 text-lg">%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      asymmetryIndex <= 10 ? 'bg-emerald-500' : asymmetryIndex <= 20 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, asymmetryIndex * 2.5)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {asymmetryIndex <= 10 ? 'Bilateral symmetry good' : asymmetryIndex <= 20 ? 'Moderate asymmetry detected' : 'Significant asymmetry — corrective exercise needed'}
                </p>
              </div>
            </div>

            {/* Test Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Movement Test Breakdown</h3>
              <div className="space-y-3">
                {MOVEMENT_TESTS.map(t => {
                  const r = testResults[t.id];
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {r?.compensations.length
                            ? r.compensations.join(' · ')
                            : 'No compensations detected'}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-lg font-black text-slate-900">{r?.score ?? 0}</span>
                        <span className="text-slate-400 text-xs">/100</span>
                        <p className="text-xs text-slate-500">Sym: {r?.symmetry ?? 0}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="text-lg font-bold">AI Analysis Summary</h3>
              </div>
              <p className="text-indigo-100 leading-relaxed">
                {overallScore >= 70
                  ? 'Your movement patterns show good overall mobility and biomechanical efficiency. Minor asymmetries are within normal range. Continue maintaining your current activity levels with quarterly reassessment.'
                  : overallScore >= 50
                  ? 'Moderate biomechanical inefficiencies detected. Movement patterns suggest areas for improvement, particularly in lower body symmetry and joint mobility. A targeted corrective exercise program should yield significant improvement.'
                  : 'Significant movement dysfunction identified. Your assessment reveals notable asymmetries and limited mobility that are likely contributing to pain or injury risk. Clinical evaluation and a structured rehabilitation program are strongly recommended.'}
              </p>
              {asymmetryIndex > 15 && (
                <div className="mt-3 p-3 bg-white/10 rounded-xl text-sm text-indigo-200">
                  <strong>Note:</strong> Your asymmetry index of {asymmetryIndex}% is above the 15% threshold. Consider bilateral strength training and gait correction exercises.
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => { setStep(2); setCurrentTest(MOVEMENT_TESTS.length - 1); }}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-sm flex items-center hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Retake Tests
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold flex items-center hover:from-emerald-700 hover:to-teal-700 shadow-lg"
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
