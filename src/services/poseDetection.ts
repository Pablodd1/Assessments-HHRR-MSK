/**
 * MediaPipe Pose Service
 * Real-time pose estimation + joint angle analysis for motion capture assessment.
 * All processing runs client-side — no video data leaves the device.
 */

import type { Pose } from '@mediapipe/pose';

// ─────────────────────────────────────────────────────────────────────────────
// Landmark indices (MediaPipe Pose 33-landmark model)
// ─────────────────────────────────────────────────────────────────────────────
export const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export type LandmarkKey = keyof typeof LANDMARKS;
export type LandmarkIndex = typeof LANDMARKS[LandmarkKey];

export interface NormalizedLandmark {
  x: number; // 0-1 (left to right)
  y: number; // 0-1 (top to bottom)
  z: number; // depth (relative)
  visibility: number; // 0-1 confidence
}

export type LandmarkArray = NormalizedLandmark[];

// ─────────────────────────────────────────────────────────────────────────────
// Angle calculation helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Calculate angle between three points (a = vertex) in degrees */
function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/** Get a landmark from the landmark array by index */
function lm(landmarks: LandmarkArray, idx: LandmarkIndex): NormalizedLandmark {
  return landmarks[idx];
}

/** Visibility threshold — landmarks below this are considered missing */
const VISIBILITY_THRESHOLD = 0.5;

// ─────────────────────────────────────────────────────────────────────────────
// Movement-specific analyzers
// ─────────────────────────────────────────────────────────────────────────────

export interface SquatAnalysis {
  leftKneeAngle: number;
  rightKneeAngle: number;
  hipDrop: number; // asymmetry: left vs right hip y
  spineLean: number; // forward lean angle
  asymmetryPercent: number;
  score: number; // 0-100
  compensations: string[];
}

export interface OverheadReachAnalysis {
  leftShoulderElevation: number;
  rightShoulderElevation: number;
  symmetryPercent: number;
  score: number;
  compensations: string[];
}

export interface GaitAnalysis {
  leftStepLength: number;
  rightStepLength: number;
  stepSymmetry: number;
  cadence: number; // steps per second estimate
  score: number;
  compensations: string[];
}

export interface CaptureFrame {
  timestamp: number;
  landmarks: LandmarkArray;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze squat (captured frames during descent → lowest point)
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeSquat(frames: CaptureFrame[]): SquatAnalysis {
  if (frames.length < 3) {
    return {
      leftKneeAngle: 90, rightKneeAngle: 90, hipDrop: 0,
      spineLean: 15, asymmetryPercent: 10, score: 50,
      compensations: ['Insufficient frames captured']
    };
  }

  // Find frame with maximum knee bend (minimum y of knee landmarks)
  let deepestFrame = frames[0];
  for (const frame of frames) {
    const lKneeY = frame.landmarks[LANDMARKS.LEFT_KNEE].y;
    const rKneeY = frame.landmarks[LANDMARKS.RIGHT_KNEE].y;
    const bestY = deepestFrame.landmarks[LANDMARKS.LEFT_KNEE].y;
    if ((lKneeY + rKneeY) / 2 < bestY) {
      deepestFrame = frame;
    }
  }

  const lmk = deepestFrame.landmarks;

  // Knee angles — knee flexed = small angle at knee joint
  const leftKneeAngle = calculateAngle(
    lmk[LANDMARKS.LEFT_HIP],
    lmk[LANDMARKS.LEFT_KNEE],
    lmk[LANDMARKS.LEFT_ANKLE]
  );
  const rightKneeAngle = calculateAngle(
    lmk[LANDMARKS.RIGHT_HIP],
    lmk[LANDMARKS.RIGHT_KNEE],
    lmk[LANDMARKS.RIGHT_ANKLE]
  );

  // Hip drop asymmetry
  const hipDrop = Math.abs(
    lmk[LANDMARKS.LEFT_HIP].y - lmk[LANDMARKS.RIGHT_HIP].y
  ) * 100;

  // Spine forward lean (neck to mid-hip angle)
  const spineLean = calculateAngle(
    lmk[LANDMARKS.NOSE],
    {
      x: (lmk[LANDMARKS.LEFT_HIP].x + lmk[LANDMARKS.RIGHT_HIP].x) / 2,
      y: (lmk[LANDMARKS.LEFT_HIP].y + lmk[LANDMARKS.RIGHT_HIP].y) / 2,
      z: 0, visibility: 1
    },
    {
      x: (lmk[LANDMARKS.LEFT_SHOULDER].x + lmk[LANDMARKS.RIGHT_SHOULDER].x) / 2,
      y: (lmk[LANDMARKS.LEFT_SHOULDER].y + lmk[LANDMARKS.RIGHT_SHOULDER].y) / 2,
      z: 0, visibility: 1
    }
  );

  // Symmetry: knee angle diff
  const angleDiff = Math.abs(leftKneeAngle - rightKneeAngle);
  const asymmetryPercent = Math.min(100, angleDiff * 2);

  // Score: deeper squat = better (within range), asymmetric = worse
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  // Ideal squat: knee angle 70-120°
  const depthScore = avgKneeAngle < 70 ? 100 : avgKneeAngle > 140 ? 40 : 100 - (avgKneeAngle - 70) * 1.5;
  const symmetryScore = Math.max(0, 100 - asymmetryPercent * 3);
  const leanPenalty = spineLean > 45 ? (spineLean - 45) * 2 : 0;
  const score = Math.max(0, Math.min(100, Math.round(depthScore * 0.5 + symmetryScore * 0.5 - leanPenalty)));

  // Compensations
  const compensations: string[] = [];
  if (asymmetryPercent > 15) compensations.push('Knee valgus — left/right imbalance');
  if (spineLean > 45) compensations.push(`Forward trunk lean (${Math.round(spineLean)}°)`);
  if (hipDrop > 8) compensations.push('Hip drop / lateral tilt');
  if (avgKneeAngle > 130) compensations.push('Shallow squat depth');

  return { leftKneeAngle: Math.round(leftKneeAngle), rightKneeAngle: Math.round(rightKneeAngle), hipDrop: Math.round(hipDrop * 10) / 10, spineLean: Math.round(spineLean), asymmetryPercent: Math.round(asymmetryPercent), score, compensations };
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze overhead reach (max elevation during hold)
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeOverheadReach(frames: CaptureFrame[]): OverheadReachAnalysis {
  if (frames.length < 3) {
    return { leftShoulderElevation: 160, rightShoulderElevation: 160, symmetryPercent: 100, score: 60, compensations: [] };
  }

  // Find peak elevation (minimum y = highest point)
  let peakFrame = frames[0];
  for (const frame of frames) {
    const avgWristY = (frame.landmarks[LANDMARKS.LEFT_WRIST].y + frame.landmarks[LANDMARKS.RIGHT_WRIST].y) / 2;
    const bestY = (peakFrame.landmarks[LANDMARKS.LEFT_WRIST].y + peakFrame.landmarks[LANDMARKS.RIGHT_WRIST].y) / 2;
    if (avgWristY < bestY) peakFrame = frame;
  }

  const lmk = peakFrame.landmarks;

  // Shoulder elevation: angle of upper arm relative to vertical
  const leftShoulderElevation = calculateAngle(
    lmk[LANDMARKS.LEFT_ELBOW],
    lmk[LANDMARKS.LEFT_SHOULDER],
    { x: lmk[LANDMARKS.LEFT_SHOULDER].x, y: lmk[LANDMARKS.LEFT_SHOULDER].y - 0.2, z: 0, visibility: 1 }
  );
  const rightShoulderElevation = calculateAngle(
    lmk[LANDMARKS.RIGHT_ELBOW],
    lmk[LANDMARKS.RIGHT_SHOULDER],
    { x: lmk[LANDMARKS.RIGHT_SHOULDER].x, y: lmk[LANDMARKS.RIGHT_SHOULDER].y - 0.2, z: 0, visibility: 1 }
  );

  const symmetryPercent = Math.max(0, 100 - Math.abs(leftShoulderElevation - rightShoulderElevation) * 2);
  const avgElevation = (leftShoulderElevation + rightShoulderElevation) / 2;
  // Above 150° = good overhead reach
  const elevationScore = avgElevation > 160 ? 100 : Math.max(0, (avgElevation - 90) * (100 / 70));
  const score = Math.round(elevationScore * 0.5 + symmetryPercent * 0.5);

  const compensations: string[] = [];
  if (symmetryPercent < 80) compensations.push('Limited bilateral elevation — dominant side compensation');
  if (avgElevation < 140) compensations.push(`Reduced shoulder elevation (${Math.round(avgElevation)}°)`);

  return {
    leftShoulderElevation: Math.round(leftShoulderElevation),
    rightShoulderElevation: Math.round(rightShoulderElevation),
    symmetryPercent: Math.round(symmetryPercent),
    score,
    compensations
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze gait (walking in place — step symmetry)
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeGait(frames: CaptureFrame[]): GaitAnalysis {
  if (frames.length < 6) {
    return { leftStepLength: 0.12, rightStepLength: 0.12, stepSymmetry: 100, cadence: 1.5, score: 60, compensations: [] };
  }

  // Track ankle positions over time to detect steps
  const ankleSamples: { lx: number; ly: number; rx: number; ry: number; t: number }[] = [];
  for (const frame of frames) {
    const lmk = frame.landmarks;
    ankleSamples.push({
      lx: lmk[LANDMARKS.LEFT_ANKLE].x,
      ly: lmk[LANDMARKS.LEFT_ANKLE].y,
      rx: lmk[LANDMARKS.RIGHT_ANKLE].x,
      ry: lmk[LANDMARKS.RIGHT_ANKLE].y,
      t: frame.timestamp
    });
  }

  // Step detection: significant x-direction movement of ankles
  const leftSteps: number[] = [];
  const rightSteps: number[] = [];
  for (let i = 1; i < ankleSamples.length; i++) {
    const prev = ankleSamples[i - 1];
    const curr = ankleSamples[i];
    const lStep = Math.abs(curr.lx - prev.lx);
    const rStep = Math.abs(curr.rx - prev.rx);
    if (lStep > 0.04) leftSteps.push(lStep);
    if (rStep > 0.04) rightSteps.push(rStep);
  }

  const avgLeft = leftSteps.length > 0 ? leftSteps.reduce((a, b) => a + b, 0) / leftSteps.length : 0.1;
  const avgRight = rightSteps.length > 0 ? rightSteps.reduce((a, b) => a + b, 0) / rightSteps.length : 0.1;

  const stepSymmetry = Math.max(0, 100 - Math.abs(avgLeft - avgRight) / Math.max(avgLeft, avgRight) * 100);

  // Cadence: steps per second
  const durationSec = (ankleSamples[ankleSamples.length - 1].t - ankleSamples[0].t) / 1000;
  const totalSteps = leftSteps.length + rightSteps.length;
  const cadence = durationSec > 0 ? Math.round((totalSteps / durationSec) * 10) / 10 : 1.5;

  // Score
  const symmetryScore = stepSymmetry;
  const cadenceScore = cadence >= 1.0 && cadence <= 2.5 ? 100 : Math.max(0, 100 - Math.abs(cadence - 1.75) * 40);
  const score = Math.round(symmetryScore * 0.6 + cadenceScore * 0.4);

  const compensations: string[] = [];
  if (stepSymmetry < 80) compensations.push('Step length asymmetry — antalgic gait pattern');
  if (cadence < 1.0) compensations.push('Reduced walking cadence — possible pain guarding');

  return {
    leftStepLength: Math.round(avgLeft * 1000) / 1000,
    rightStepLength: Math.round(avgRight * 1000) / 1000,
    stepSymmetry: Math.round(stepSymmetry),
    cadence,
    score,
    compensations
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Draw skeleton overlay on canvas
// ─────────────────────────────────────────────────────────────────────────────
const CONNECTIONS = [
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW],
  [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW],
  [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
  [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
  [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
  [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
];

const KEYPOINT_INDICES = Object.values(LANDMARKS);

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkArray,
  width: number,
  height: number,
  color = '#22C55E'
): void {
  ctx.clearRect(0, 0, width, height);

  // Draw connections
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (const [i, j] of CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    if (!a || !b || a.visibility < VISIBILITY_THRESHOLD || b.visibility < VISIBILITY_THRESHOLD) continue;
    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }

  // Draw keypoints
  for (const idx of KEYPOINT_INDICES) {
    const lm = landmarks[idx];
    if (!lm || lm.visibility < VISIBILITY_THRESHOLD) continue;
    const x = lm.x * width;
    const y = lm.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
