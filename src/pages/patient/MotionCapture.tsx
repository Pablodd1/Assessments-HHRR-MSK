import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Camera, ChevronRight, ChevronLeft, AlertCircle,
  CheckCircle2, ArrowRight, X, RotateCcw
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';
import {
  drawSkeleton, analyzeSquat, analyzeOverheadReach, analyzeGait,
  type CaptureFrame, type SquatAnalysis, type OverheadReachAnalysis, type GaitAnalysis
} from '../../services/poseDetection';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface MovementTestResult {
  score: number;
  symmetry: number;
  compensations: string[];
  // Raw analysis for display
  rawAnalysis?: SquatAnalysis | OverheadReachAnalysis | GaitAnalysis;
}

interface MovementTest {
  id: string;
  name: string;
  description: string;
  duration: number;
  keypoints: string[];
  analyzer: (frames: CaptureFrame[]) => SquatAnalysis | OverheadReachAnalysis | GaitAnalysis;
  getDisplay: (result: SquatAnalysis | OverheadReachAnalysis | GaitAnalysis) => {
    primary: string;
    secondary: string;
    symLabel: string;
  };
}

const MOVEMENT_TESTS: MovementTest[] = [
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    description: 'Stand with feet shoulder-width apart, squat down as low as comfortable, and return to standing',
    duration: 5,
    keypoints: ['knees', 'hips', 'ankles', 'spine'],
    analyzer: analyzeSquat,
    getDisplay: (r: any) => ({
      primary: `Knee: ${r.leftKneeAngle}° / ${r.rightKneeAngle}°`,
      secondary: `Spine lean: ${r.spineLean}°`,
      symLabel: `Asymmetry: ${r.asymmetryPercent}%`
    })
  },
  {
    id: 'overhead_reach',
    name: 'Overhead Reach',
    description: 'Raise both arms overhead and hold for the countdown — keep your back straight',
    duration: 4,
    keypoints: ['shoulders', 'spine', 'hips'],
    analyzer: analyzeOverheadReach,
    getDisplay: (r: any) => ({
      primary: `Shoulders: ${r.leftShoulderElevation}° / ${r.rightShoulderElevation}°`,
      secondary: `Elevation score above 150° is optimal`,
      symLabel: `Symmetry: ${r.symmetryPercent}%`
    })
  },
  {
    id: 'gait',
    name: 'Walking Gait',
    description: 'Walk naturally in place — we will analyze your step pattern and balance',
    duration: 10,
    keypoints: ['knees', 'ankles', 'hips'],
    analyzer: analyzeGait,
    getDisplay: (r: any) => ({
      primary: `Cadence: ${r.cadence} steps/sec`,
      secondary: `Steps L/R: ${r.leftStepLength} / ${r.rightStepLength}`,
      symLabel: `Symmetry: ${r.stepSymmetry}%`
    })
  }
];

// Static skeleton keypoints for the setup screen
const BODY_KEYPOINTS = [
  { id: 'head',          x: 50, y: 8  },
  { id: 'neck',          x: 50, y: 15 },
  { id: 'left_shoulder', x: 35, y: 22 },
  { id: 'right_shoulder',x: 65, y: 22 },
  { id: 'left_elbow',    x: 25, y: 35 },
  { id: 'right_elbow',   x: 75, y: 35 },
  { id: 'left_wrist',    x: 20, y: 48 },
  { id: 'right_wrist',   x: 80, y: 48 },
  { id: 'left_hip',      x: 42, y: 48 },
  { id: 'right_hip',     x: 58, y: 48 },
  { id: 'left_knee',     x: 40, y: 65 },
  { id: 'right_knee',    x: 60, y: 65 },
  { id: 'left_ankle',    x: 39, y: 82 },
  { id: 'right_ankle',   x: 61, y: 82 }
];

// ─────────────────────────────────────────
// Pose Estimator Manager
// ─────────────────────────────────────────
let poseInstance: any = null;
let poseLoading = false;

async function getPose(): Promise<any> {
  if (poseInstance) return poseInstance;
  if (poseLoading) {
    // Wait for existing load
    while (poseLoading) await new Promise(r => setTimeout(r, 100));
    return poseInstance;
  }
  poseLoading = true;
  try {
    const { Pose } = await import('@mediapipe/pose');
    poseInstance = new Pose({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    poseInstance.setOptions({
      modelComplexity: 1,      // 0=lightest,1=full,2=heavy — 1 is best balance
      smoothLandmarks: true,    // temporal smoothing for stable tracking
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    await poseInstance.initialize();
    return poseInstance;
  } finally {
    poseLoading = false;
  }
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const MotionCapture = () => {
  const navigate = useNavigate();
  const { currentUser, addClinicalAssessment, employees } = useDemo();

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const poseRef    = useRef<any>(null);
  const framesRef  = useRef<CaptureFrame[]>([]);
  const analyzeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skeletonDrawnRef = useRef(false);

  const [step,              setStep]              = useState<1 | 2 | 3>(1);
  const [cameraPermission,  setCameraPermission]  = useState<'pending' | 'granted' | 'denied' | 'loading'>('pending');
  const [currentTest,       setCurrentTest]       = useState(0);
  const [testStarted,       setTestStarted]       = useState(false);
  const [countdown,         setCountdown]         = useState<number | null>(null);
  const [testResults,       setTestResults]       = useState<Record<string, MovementTestResult>>({});
  const [resultId]          = useState(() => `mot-${Date.now()}`);
  const [poseReady,         setPoseReady]         = useState(false);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      if (analyzeIntervalRef.current) clearInterval(analyzeIntervalRef.current);
      poseInstance = null;
    };
  }, []);

  // Computed
  const overallScore      = useMemo(() => {
    const results = Object.values(testResults) as MovementTestResult[];
    if (!results.length) return 0;
    return Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  }, [testResults]);

  const asymmetryIndex    = useMemo(() => {
    const results = Object.values(testResults) as MovementTestResult[];
    if (!results.length) return 0;
    const avgSym = results.reduce((a, r) => a + r.symmetry, 0) / results.length;
    return Math.round(100 - avgSym);
  }, [testResults]);

  const completedCount    = Object.keys(testResults).length;
  const currentTestData  = MOVEMENT_TESTS[currentTest];
  const currentResult    = testResults[currentTestData?.id];
  const allTestsComplete = completedCount === MOVEMENT_TESTS.length;

  // ── Request camera ──
  const requestCamera = useCallback(async () => {
    try {
      setCameraPermission('loading');
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

      // Pre-load MediaPipe Pose in background
      getPose().then(pose => {
        poseRef.current = pose;
        setPoseReady(true);
      }).catch(() => {
        // MediaPipe failed — component still works with static skeleton
        setPoseReady(false);
      });
    } catch {
      setCameraPermission('denied');
    }
  }, []);

  // ── Draw skeleton on overlay canvas ──
  const drawOverlay = useCallback((landmarks: any[]) => {
    if (!overlayRef.current || !videoRef.current) return;
    const canvas = overlayRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!skeletonDrawnRef.current) {
      // First frame — set canvas size
      skeletonDrawnRef.current = true;
    }

    drawSkeleton(ctx, landmarks, canvas.width, canvas.height, '#22C55E');
  }, []);

  // ── Start MediaPipe frame processing ──
  const startPoseProcessing = useCallback(() => {
    if (!poseRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const pose = poseRef.current;

    pose.onResults((results: any) => {
      if (results.poseLandmarks) {
        drawOverlay(results.poseLandmarks);
        framesRef.current.push({
          timestamp: Date.now(),
          landmarks: results.poseLandmarks
        });
      }
    });

    // Process frames at ~30fps during test
    analyzeIntervalRef.current = setInterval(() => {
      if (video.readyState >= 2) {
        pose.send({ image: video });
      }
    }, 33);
  }, [drawOverlay]);

  // ── Start a movement test ──
  const startTest = useCallback(async () => {
    if (!currentTestData) return;
    framesRef.current = [];
    skeletonDrawnRef.current = false;
    setTestStarted(true);

    // Clear overlay
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }

    // Start MediaPipe if ready
    if (poseRef.current) {
      startPoseProcessing();
    }

    // Countdown
    for (let i = currentTestData.duration; i >= 1; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 1000));
    }
    setCountdown(null);

    // Record for a short window after countdown
    await new Promise(r => setTimeout(r, 1500));

    // Stop processing
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }

    // Analyze captured frames
    const analysis = currentTestData.analyzer(framesRef.current);
    const score = 'score' in analysis ? analysis.score : 70;
    const symKey = 'asymmetryPercent' in analysis
      ? 'asymmetryPercent'
      : 'symmetryPercent' in analysis
      ? 'symmetryPercent'
      : 'stepSymmetry' in analysis
      ? 'stepSymmetry'
      : 'symmetryPercent';
    const symmetry = 'asymmetryPercent' in analysis
      ? 100 - (analysis.asymmetryPercent as number)
      : (analysis as any)[symKey] ?? 80;

    const rawCompensations = analysis.compensations ?? [];

    setTestResults(prev => ({
      ...prev,
      [currentTestData.id]: {
        score,
        symmetry: Math.round(symmetry),
        compensations: rawCompensations,
        rawAnalysis: analysis
      }
    }));
    setTestStarted(false);
  }, [currentTestData, startPoseProcessing]);

  const nextTest = useCallback(() => {
    if (currentTest < MOVEMENT_TESTS.length - 1) {
      setCurrentTest(prev => prev + 1);
    } else {
      setStep(3);
    }
  }, [currentTest]);

  const handleSubmit = useCallback(async () => {
    if (!currentUser?.employeeId) return;
    const now = new Date().toISOString();

    addClinicalAssessment(currentUser.employeeId, {
      id: `ca-${Date.now()}`,
      employeeId: currentUser.employeeId,
      assessmentDate: now,
      assessorName: 'Self-Assessment — 3D Motion Capture (MediaPipe)',
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
        aiAnalysis: `MediaPipe pose analysis: ${completedCount} movement tests captured. Mobility score ${overallScore}/100, asymmetry index ${asymmetryIndex}%. Key compensations: ${(Object.values(testResults) as MovementTestResult[]).flatMap(r => r.compensations).join(', ') || 'none detected'}.`,
        riskFlags: (Object.values(testResults) as MovementTestResult[]).flatMap(r => r.compensations)
      },
      clinicalNotes: `Overall mobility: ${overallScore}/100, Asymmetry: ${asymmetryIndex}%`,
      aiSummary: `Motion capture complete. MediaPipe pose estimation analyzed ${framesRef.current.length} frames across ${MOVEMENT_TESTS.length} movement tests. Mobility score ${overallScore}/100 with ${asymmetryIndex}% asymmetry index.`,
      recommendedPrograms: asymmetryIndex > 15
        ? ['Gait Correction Program', 'Bilateral Strength Training']
        : ['Mobility Maintenance Program'],
      status: 'completed'
    });

    navigate(`/results/${resultId}`);
  }, [currentUser, testResults, overallScore, asymmetryIndex, addClinicalAssessment, navigate, resultId, completedCount]);

  const resetAssessment = useCallback(() => {
    setTestResults({});
    setCurrentTest(0);
    setStep(2);
  }, []);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/assessment')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <ScanLine className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">3D Motion Assessment</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                {step === 1 && 'Camera Setup'}
                {step === 2 && `Test ${currentTest + 1} of ${MOVEMENT_TESTS.length} — ${currentTestData?.name}`}
                {step === 3 && 'Analysis Complete'}
                {poseReady && step < 3 && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    AI active
                  </span>
                )}
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

      <div className="max-w-4xl mx-auto p-6 space-y-5">

        {/* ── STEP 1: Camera Setup ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Camera Setup</h2>
              <p className="text-sm text-slate-500 mb-6">
                Position yourself so your full body is visible. Use a well-lit area and stand about 6 feet from the camera.
              </p>

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

              {cameraPermission === 'loading' && (
                <div className="text-center py-14">
                  <div className="w-16 h-16 mx-auto mb-5 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  <h3 className="font-bold text-slate-900 mb-2">Starting camera…</h3>
                </div>
              )}

              {cameraPermission === 'denied' && (
                <div className="text-center py-14">
                  <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-400" />
                  <h3 className="font-bold text-slate-900 mb-2">Camera Access Denied</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                    Please enable camera access in your browser settings, then reload the page.
                  </p>
                  <button onClick={() => navigate('/assessment')} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50">
                    Go Back
                  </button>
                </div>
              )}

              {cameraPermission === 'granted' && (
                <>
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

                    {/* Pose skeleton overlay */}
                    <canvas
                      ref={overlayRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ zIndex: 2 }}
                    />

                    {/* Setup guide skeleton */}
                    {!poseReady && (
                      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
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
                      </div>
                    )}

                    {poseReady && (
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        MediaPipe Active
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white text-xs p-3 rounded-xl text-center z-10">
                      Ensure full body is visible — head to toes
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Camera ready{poseReady ? ' — MediaPipe AI loaded' : ' — loading AI model…'}</span>
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
                  Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Movement Tests ── */}
        {step === 2 && currentTestData && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Test Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  Test {currentTest + 1} of {MOVEMENT_TESTS.length}
                </span>
                <span className="text-xs text-slate-500">{currentTestData.duration}s capture window</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{currentTestData.name}</h3>
              <p className="text-slate-600 text-sm mb-5">{currentTestData.description}</p>

              {/* Video + Overlay */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video mb-5">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 2 }}
                />

                {/* Recording indicator */}
                <AnimatePresence>
                  {testStarted && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10"
                    >
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      CAPTURING
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
                      className="absolute inset-0 flex items-center justify-center bg-black/70 z-10"
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
                      className="absolute inset-0 flex items-center justify-center bg-black/80 z-10"
                    >
                      <div className="text-center">
                        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                        <p className="text-white text-2xl font-bold">
                          Score: {currentResult.score}<span className="text-slate-400 text-lg">/100</span>
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          {currentTestData.getDisplay(currentResult.rawAnalysis as any).primary}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {currentTestData.getDisplay(currentResult.rawAnalysis as any).symLabel}
                        </p>
                        {currentResult.rawAnalysis && (
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {(currentResult.rawAnalysis as any).compensations?.map((c: string) => (
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

              {/* Analysis display */}
              {currentResult && !testStarted && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Analysis</p>
                  <p className="text-sm text-slate-700">
                    {currentTestData.getDisplay(currentResult.rawAnalysis as any).secondary}
                  </p>
                  {currentResult.compensations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {currentResult.compensations.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3">
                {!testStarted && !currentResult && (
                  <button
                    onClick={startTest}
                    disabled={cameraPermission !== 'granted'}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {cameraPermission === 'loading' ? 'Loading AI…' : 'Start Test'}
                  </button>
                )}
                {currentResult && !testStarted && (
                  <button
                    onClick={nextTest}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors"
                  >
                    {allTestsComplete ? 'View Results' : 'Next Test'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Completed:</span>
              {MOVEMENT_TESTS.map(t => (
                <span key={t.id} className={`px-2 py-0.5 rounded-full ${testResults[t.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                  {t.name} {testResults[t.id] ? `(${testResults[t.id].score})` : ''}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm font-medium mb-1">Overall Mobility Score</p>
                  <p className="text-6xl font-black">{overallScore}<span className="text-3xl text-emerald-300">/100</span></p>
                  <p className="text-emerald-200 text-sm mt-2">
                    Asymmetry Index: {asymmetryIndex}% · {completedCount} tests analyzed
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full border-8 border-emerald-400 flex items-center justify-center">
                  <span className="text-3xl font-black">
                    {overallScore >= 80 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : 'D'}
                  </span>
                </div>
              </div>
            </div>

            {/* Per-test breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Test Breakdown</h3>
              <div className="space-y-4">
                {MOVEMENT_TESTS.map(t => {
                  const result = testResults[t.id];
                  const display = result ? t.getDisplay(result.rawAnalysis as any) : null;
                  return (
                    <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{t.name}</p>
                        {display && (
                          <p className="text-xs text-slate-500 mt-0.5">{display.primary}</p>
                        )}
                        {result && result.compensations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.compensations.map(c => (
                              <span key={c} className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded font-medium">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black ${
                          !result ? 'text-slate-300' :
                          result.score >= 80 ? 'text-emerald-600' :
                          result.score >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {result?.score ?? '—'}
                        </span>
                        {result && <span className="text-slate-400 text-sm">/100</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="p-1 bg-indigo-100 rounded-lg"><ScanLine className="w-4 h-4 text-indigo-600" /></span>
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {asymmetryIndex > 15 ? (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Bilateral asymmetry detected</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                          Your asymmetry index of {asymmetryIndex}% suggests muscle imbalance. Targeted bilateral training recommended.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-700">Suggested programs: <span className="font-medium">Gait Correction Program, Bilateral Strength Training</span></p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-900">Movement patterns within normal range</p>
                      <p className="text-sm text-emerald-700 mt-0.5">
                        Continue with mobility maintenance. Re-assess in 3 months.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetAssessment}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reassess
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
