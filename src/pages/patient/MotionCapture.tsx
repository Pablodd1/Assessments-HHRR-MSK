import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  RefreshCw
} from 'lucide-react';

const MOVEMENT_TESTS = [
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    description: 'Stand with feet shoulder-width apart, squat down as low as comfortable',
    duration: 5,
    keypoints: ['knees', 'hips', 'ankles', 'spine']
  },
  {
    id: 'overhead_reach',
    name: 'Overhead Reach',
    description: 'Raise both arms overhead and hold for 3 seconds',
    duration: 4,
    keypoints: ['shoulders', 'spine', 'hips']
  },
  {
    id: 'gait',
    name: 'Walking Gait',
    description: 'Walk naturally in place for 10 steps',
    duration: 10,
    keypoints: ['knees', 'ankles', 'hips']
  }
];

const BODY_KEYPOINTS = [
  { id: 'head', x: 50, y: 8 },
  { id: 'neck', x: 50, y: 15 },
  { id: 'left_shoulder', x: 35, y: 22 },
  { id: 'right_shoulder', x: 65, y: 22 },
  { id: 'left_elbow', x: 25, y: 35 },
  { id: 'right_elbow', x: 75, y: 35 },
  { id: 'left_wrist', x: 20, y: 48 },
  { id: 'right_wrist', x: 80, y: 48 },
  { id: 'left_hip', x: 42, y: 48 },
  { id: 'right_hip', x: 58, y: 48 },
  { id: 'left_knee', x: 40, y: 65 },
  { id: 'right_knee', x: 60, y: 65 },
  { id: 'left_ankle', x: 39, y: 82 },
  { id: 'right_ankle', x: 61, y: 82 }
];

export const MotionCapture = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(1);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [currentTest, setCurrentTest] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { score: number; symmetry: number; compensations: string[] }>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultId] = useState(() => `mot-${Date.now()}`);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraPermission('granted');
    } catch {
      setCameraPermission('denied');
    }
  };

  const startTest = async () => {
    setTestStarted(true);
    for (let i = MOVEMENT_TESTS[currentTest].duration; i >= 1; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 1000));
    }
    setCountdown(null);

    // Simulate capturing the movement analysis
    await new Promise(r => setTimeout(r, 1500));

    // Simulate AI analysis result
    const test = MOVEMENT_TESTS[currentTest];
    const scores = [
      { score: Math.round(55 + Math.random() * 35), symmetry: Math.round(60 + Math.random() * 30), compensations: ['Knee valgus', 'Forward lean'] },
      { score: Math.round(65 + Math.random() * 25), symmetry: Math.round(70 + Math.random() * 25), compensations: [] },
      { score: Math.round(50 + Math.random() * 40), symmetry: Math.round(55 + Math.random() * 35), compensations: ['Antalgic gait detected'] }
    ];
    const result = scores[currentTest];

    // Capture frame
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      ctx?.drawImage(videoRef.current, 0, 0);
      setCapturedFrame(canvasRef.current.toDataURL());
    }

    setTestResults(prev => ({
      ...prev,
      [test.id]: result
    }));
    setTestStarted(false);
  };

  const nextTest = () => {
    if (currentTest < MOVEMENT_TESTS.length - 1) {
      setCurrentTest(prev => prev + 1);
      setCapturedFrame(null);
    } else {
      setStep(3);
    }
  };

  const getOverallScore = () => {
    const results = Object.values(testResults);
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
  };

  const getAsymmetryIndex = () => {
    const results = Object.values(testResults);
    if (results.length === 0) return 0;
    const avgSym = results.reduce((acc, r) => acc + r.symmetry, 0) / results.length;
    return Math.round(100 - avgSym);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <ScanLine className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">3D Motion Assessment</h1>
            <p className="text-xs text-slate-500">
              {step === 1 && 'Camera Setup'}
              {step === 2 && `Movement Test ${currentTest + 1} of ${MOVEMENT_TESTS.length}`}
              {step === 3 && 'Analysis Complete'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* STEP 1: Camera Setup */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Camera Setup</h2>
              <p className="text-sm text-slate-500 mb-6">Position yourself so your full body is visible in the camera</p>

              {cameraPermission === 'pending' && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Camera Access Required</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                    We'll use your camera to capture movement patterns. No video is stored — all analysis happens locally.
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
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="font-bold text-slate-900 mb-2">Camera Access Denied</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Please enable camera access in your browser settings to use this feature.
                  </p>
                </div>
              )}

              {cameraPermission === 'granted' && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Body overlay guide */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Skeletal guide lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-30">
                      {/* Spine */}
                      <line x1="50%" y1="15%" x2="50%" y2="48%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                      {/* Arms */}
                      <line x1="35%" y1="22%" x2="20%" y2="48%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                      <line x1="65%" y1="22%" x2="80%" y2="48%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                      {/* Legs */}
                      <line x1="42%" y1="48%" x2="39%" y2="82%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                      <line x1="58%" y1="48%" x2="61%" y2="82%" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
                      {/* Joints */}
                      {BODY_KEYPOINTS.map(kp => (
                        <circle key={kp.id} cx={`${kp.x}%`} cy={`${kp.y}%`} r="3" fill="#22C55E" opacity="0.6" />
                      ))}
                    </svg>

                    {/* Guide text */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white text-xs p-3 rounded-xl text-center">
                      Ensure full body is visible from head to toes
                    </div>
                  </div>
                </div>
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

        {/* STEP 2: Movement Tests */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Current Test */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  Test {currentTest + 1} / {MOVEMENT_TESTS.length}
                </span>
                <span className="text-sm text-slate-500">{MOVEMENT_TESTS[currentTest].name}</span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {MOVEMENT_TESTS[currentTest].name}
              </h3>
              <p className="text-slate-600 mb-6">{MOVEMENT_TESTS[currentTest].description}</p>

              {/* Video Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video mb-6">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

                {/* Live skeleton overlay */}
                {testStarted && (
                  <svg className="absolute inset-0 w-full h-full opacity-50">
                    <line x1="35%" y1="22%" x2="25%" y2="35%" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="65%" y1="22%" x2="75%" y2="35%" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="50%" y1="15%" x2="50%" y2="22%" stroke="#F59E0B" strokeWidth="3" />
                    <motion.circle
                      cx="50%"
                      cy={countdown ? '45%' : '40%'}
                      r="12"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </svg>
                )}

                {/* Countdown */}
                {countdown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <motion.span
                      key={countdown}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="text-8xl font-black text-white"
                    >
                      {countdown}
                    </motion.span>
                  </div>
                )}

                {/* Result overlay */}
                {testResults[MOVEMENT_TESTS[currentTest].id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                      <p className="text-white text-2xl font-bold">
                        Score: {testResults[MOVEMENT_TESTS[currentTest].id].score}/100
                      </p>
                      <p className="text-slate-300 text-sm mt-1">
                        Symmetry: {testResults[MOVEMENT_TESTS[currentTest].id].symmetry}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Captured frame */}
              {capturedFrame && !testResults[MOVEMENT_TESTS[currentTest].id] && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img src={capturedFrame} alt="Captured" className="w-full object-cover rounded-xl" />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                {!testResults[MOVEMENT_TESTS[currentTest].id] ? (
                  <button
                    onClick={startTest}
                    disabled={testStarted}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {testStarted ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
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
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center hover:bg-emerald-700"
                  >
                    {currentTest < MOVEMENT_TESTS.length - 1 ? (
                      <>
                        Next Test
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        View Results
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-3">
              {MOVEMENT_TESTS.map((test, i) => (
                <div
                  key={test.id}
                  className={`flex-1 h-2 rounded-full ${
                    testResults[test.id]
                      ? 'bg-emerald-500'
                      : i === currentTest
                      ? 'bg-emerald-300 animate-pulse'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Analysis Complete */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                <h2 className="text-3xl font-black mb-2">Assessment Complete</h2>
                <p className="text-emerald-100">Your 3D motion analysis is ready</p>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Overall Mobility</p>
                <span className="text-4xl font-black text-slate-900">{getOverallScore()}</span>
                <span className="text-slate-400">/100</span>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      getOverallScore() >= 70 ? 'bg-emerald-500' :
                      getOverallScore() >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${getOverallScore()}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Asymmetry Index</p>
                <span className="text-4xl font-black text-slate-900">{getAsymmetryIndex()}%</span>
                <span className="text-slate-400"> deviation</span>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      getAsymmetryIndex() <= 10 ? 'bg-emerald-500' :
                      getAsymmetryIndex() <= 20 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${getAsymmetryIndex()}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Movement Test Breakdown</h3>
              <div className="space-y-3">
                {MOVEMENT_TESTS.map(test => {
                  const result = testResults[test.id];
                  return (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900">{test.name}</p>
                        <p className="text-xs text-slate-500">
                          {result?.compensations.length ? result.compensations.join(', ') : 'No compensations detected'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">{result?.score || 0}</span>
                        <span className="text-slate-400 text-xs">/100</span>
                        <p className="text-xs text-slate-500">Sym: {result?.symmetry || 0}%</p>
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
                Your movement analysis reveals moderate biomechanical inefficiencies, primarily in lower body symmetry.
                The squat test showed knee valgus with forward lean compensation — a common pattern associated with hip weakness.
                The overhead reach showed good bilateral symmetry. Gait analysis detected mild antalgic patterns, suggesting possible discomfort affecting your gait cycle.
                Recommended: Hip strengthening program and gait correction exercises.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/results/${resultId}`)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold flex items-center hover:from-emerald-700 hover:to-teal-700 shadow-lg"
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
