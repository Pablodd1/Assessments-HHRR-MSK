/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERGONOMIC SCORING ENGINE — Evidence-Based REBA, RULA & NIOSH RLE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sources & Provenance:
 *   REBA — Hignett & McAtamney (2000), via Cornell ergonomics teaching materials
 *   RULA — McAtamney & Corlett (1993), via Cornell RULA worksheet
 *   NIOSH RLE — Waters et al. (1993), NIOSH Applications Manual
 *
 * IMPORTANT: These are well-established third-party posture assessment tools.
 *   They are NOT official OSHA formulas. OSHA references them as accepted methods
 *   but does not issue or mandate specific scoring formulas.
 *
 * regulatory_status = "published_ergonomic_method"
 * source_class = "peer_reviewed_published"
 */

// ─── REBA (Rapid Entire Body Assessment) ──────────────────────────────

export interface REBAInput {
  // Group A: Trunk, Neck, Legs
  trunkAngle: number;        // degrees from neutral (0 = upright)
  trunkSideBend: boolean;
  trunkTwist: boolean;
  neckAngle: number;         // degrees (0-20 = score 1, >20 = score 2)
  neckSideBend: boolean;
  neckTwist: boolean;
  legsBilateral: boolean;    // both feet on ground, balanced
  legsFlexionAngle: number;  // knee flexion degrees
  // Group B: Upper Arms, Lower Arms, Wrists
  upperArmAngle: number;     // degrees from neutral
  upperArmAbducted: boolean;
  shoulderRaised: boolean;
  armSupported: boolean;
  lowerArmAngle: number;     // degrees (60-100 = score 1, else = score 2)
  wristAngle: number;        // degrees from neutral
  wristTwist: boolean;
  // Load / Force
  loadKg: number;
  loadShockOrRapid: boolean;
  // Coupling
  couplingQuality: 'good' | 'fair' | 'poor' | 'unacceptable';
  // Activity
  staticHold: boolean;       // body part static > 1 minute
  repeatedAction: boolean;   // small-range repeated > 4x/min
  rapidPosturalChange: boolean;
}

export interface REBAResult {
  scoreA: number;
  scoreB: number;
  scoreC: number;
  finalScore: number;
  riskLevel: 'Negligible' | 'Low' | 'Medium' | 'High' | 'Very High';
  actionLevel: string;
  provenance: {
    tool_type: string;
    source_class: string;
    regulatory_status: string;
    citation: string;
  };
}

function scoreTrunk(angle: number, sideBend: boolean, twist: boolean): number {
  let score: number;
  const absAngle = Math.abs(angle);
  if (absAngle === 0) score = 1;
  else if (absAngle <= 20) score = 2;
  else if (absAngle <= 60) score = 3;
  else score = 4;
  if (sideBend) score += 1;
  if (twist) score += 1;
  return score;
}

function scoreNeck(angle: number, sideBend: boolean, twist: boolean): number {
  let score = angle >= 0 && angle <= 20 ? 1 : 2;
  if (sideBend) score += 1;
  if (twist) score += 1;
  return score;
}

function scoreLegs(bilateral: boolean, flexionAngle: number): number {
  let score = bilateral ? 1 : 2;
  if (flexionAngle > 30 && flexionAngle <= 60) score += 1;
  else if (flexionAngle > 60) score += 2;
  return score;
}

function scoreUpperArm(angle: number, abducted: boolean, shoulderRaised: boolean, supported: boolean): number {
  let score: number;
  const absAngle = Math.abs(angle);
  if (absAngle <= 20) score = 1;
  else if (absAngle <= 45) score = 2;
  else if (absAngle <= 90) score = 3;
  else score = 4;
  if (abducted || shoulderRaised) score += 1;
  if (supported) score -= 1;
  return Math.max(1, score);
}

function scoreLowerArm(angle: number): number {
  return (angle >= 60 && angle <= 100) ? 1 : 2;
}

function scoreWrist(angle: number, twist: boolean): number {
  let score = Math.abs(angle) <= 15 ? 1 : 2;
  if (twist) score += 1;
  return score;
}

function getLoadForceScore(kg: number, shock: boolean): number {
  let score: number;
  if (kg < 5) score = 0;
  else if (kg <= 10) score = 1;
  else score = 2;
  if (shock) score += 1;
  return score;
}

function getCouplingScore(quality: 'good' | 'fair' | 'poor' | 'unacceptable'): number {
  switch (quality) {
    case 'good': return 0;
    case 'fair': return 1;
    case 'poor': return 2;
    case 'unacceptable': return 3;
  }
}

// REBA Table A: Trunk × Neck × Legs (simplified lookup)
const TABLE_A: number[][][] = [
  // Trunk 1
  [[1,2,3,4],[2,3,4,5],[2,4,5,6],[3,5,6,7],[4,6,7,8]],
  // Trunk 2
  [[1,2,3,4],[3,4,5,6],[4,5,6,7],[5,6,7,8],[6,7,8,9]],
  // Trunk 3
  [[3,3,5,6],[4,5,6,7],[5,6,7,8],[6,7,8,9],[7,8,9,9]],
  // Trunk 4
  [[4,4,5,7],[5,6,7,8],[6,7,8,9],[7,8,9,9],[8,9,9,9]],
  // Trunk 5
  [[6,6,6,7],[7,7,7,8],[8,8,8,9],[9,9,9,9],[9,9,9,9]],
];

// REBA Table B: Upper Arm × Lower Arm × Wrist
const TABLE_B: number[][][] = [
  // Upper Arm 1
  [[1,2,2],[1,2,3]],
  // Upper Arm 2
  [[1,2,3],[2,3,4]],
  // Upper Arm 3
  [[3,4,5],[4,5,5]],
  // Upper Arm 4
  [[4,5,5],[5,6,7]],
  // Upper Arm 5
  [[6,7,8],[7,8,8]],
  // Upper Arm 6
  [[7,8,8],[8,9,9]],
];

// REBA Table C: Score A × Score B
const TABLE_C: number[][] = [
  [1,1,1,2,3,3,4,5,6,7,7],
  [1,2,2,3,4,4,5,6,6,7,7],
  [2,3,3,3,4,5,6,7,7,8,8],
  [3,4,4,4,5,6,7,8,8,9,9],
  [4,4,4,5,6,7,8,8,9,9,9],
  [6,6,6,7,8,8,9,9,10,10,10],
  [7,7,7,8,9,9,9,10,10,11,11],
  [8,8,8,9,10,10,10,10,10,11,11],
  [9,9,9,10,10,10,11,11,11,12,12],
  [10,10,10,11,11,11,11,12,12,12,12],
  [11,11,11,11,12,12,12,12,12,12,12],
  [12,12,12,12,12,12,12,12,12,12,12],
];

export function calculateREBA(input: REBAInput): REBAResult {
  const trunk = scoreTrunk(input.trunkAngle, input.trunkSideBend, input.trunkTwist);
  const neck = scoreNeck(input.neckAngle, input.neckSideBend, input.neckTwist);
  const legs = scoreLegs(input.legsBilateral, input.legsFlexionAngle);
  const upperArm = scoreUpperArm(input.upperArmAngle, input.upperArmAbducted, input.shoulderRaised, input.armSupported);
  const lowerArm = scoreLowerArm(input.lowerArmAngle);
  const wrist = scoreWrist(input.wristAngle, input.wristTwist);
  const loadForce = getLoadForceScore(input.loadKg, input.loadShockOrRapid);
  const coupling = getCouplingScore(input.couplingQuality);

  // Table A lookup (clamp indices)
  const tI = Math.min(trunk - 1, 4);
  const nI = Math.min(neck - 1, 4);
  const lI = Math.min(legs - 1, 3);
  const rawA = TABLE_A[tI]?.[nI]?.[lI] ?? 9;
  const scoreA = rawA + loadForce;

  // Table B lookup (clamp indices)
  const uI = Math.min(upperArm - 1, 5);
  const laI = Math.min(lowerArm - 1, 1);
  const wI = Math.min(wrist - 1, 2);
  const rawB = TABLE_B[uI]?.[laI]?.[wI] ?? 9;
  const scoreB = rawB + coupling;

  // Table C lookup
  const aI = Math.min(scoreA - 1, 11);
  const bI = Math.min(scoreB - 1, 10);
  const scoreC = TABLE_C[aI]?.[bI] ?? 12;

  // Activity score
  let activityScore = 0;
  if (input.staticHold) activityScore += 1;
  if (input.repeatedAction) activityScore += 1;
  if (input.rapidPosturalChange) activityScore += 1;

  const finalScore = scoreC + activityScore;

  let riskLevel: REBAResult['riskLevel'];
  let actionLevel: string;
  if (finalScore <= 1) {
    riskLevel = 'Negligible'; actionLevel = 'None necessary';
  } else if (finalScore <= 3) {
    riskLevel = 'Low'; actionLevel = 'May be necessary';
  } else if (finalScore <= 7) {
    riskLevel = 'Medium'; actionLevel = 'Necessary';
  } else if (finalScore <= 10) {
    riskLevel = 'High'; actionLevel = 'Necessary soon';
  } else {
    riskLevel = 'Very High'; actionLevel = 'Necessary now';
  }

  return {
    scoreA, scoreB, scoreC, finalScore, riskLevel, actionLevel,
    provenance: {
      tool_type: 'REBA',
      source_class: 'peer_reviewed_published',
      regulatory_status: 'not_osha_formula',
      citation: 'Hignett & McAtamney (2000). Rapid Entire Body Assessment. Applied Ergonomics, 31(2), 201-205.'
    }
  };
}


// ─── RULA (Rapid Upper Limb Assessment) ────────────────────────────────

export interface RULAInput {
  // Group A: Arm & Wrist
  upperArmAngle: number;
  upperArmAbducted: boolean;
  shoulderRaised: boolean;
  armSupported: boolean;
  lowerArmAngle: number;
  lowerArmCrossesMidline: boolean;
  wristAngle: number;
  wristDeviation: boolean;  // ulnar or radial
  wristTwist: 'mid-range' | 'end-range';
  // Group B: Neck, Trunk, Legs
  neckAngle: number;
  neckSideBend: boolean;
  neckTwist: boolean;
  trunkAngle: number;
  trunkSideBend: boolean;
  trunkTwist: boolean;
  legsSupported: boolean;   // feet flat, balanced
  // Muscle Use & Force
  muscleUseStatic: boolean; // posture static > 1 min or repeated > 4x/min
  forceLoadKg: number;
  forceShockOrRepetitive: boolean;
}

export interface RULAResult {
  grandScoreA: number;  // wrist & arm
  grandScoreB: number;  // neck, trunk & leg
  finalScore: number;
  actionLevel: 1 | 2 | 3 | 4;
  actionDescription: string;
  provenance: {
    tool_type: string;
    source_class: string;
    regulatory_status: string;
    citation: string;
  };
}

function rulaUpperArm(angle: number, abducted: boolean, raised: boolean, supported: boolean): number {
  let score: number;
  const a = Math.abs(angle);
  if (a <= 20) score = 1;
  else if (a <= 45) score = 2;
  else if (a <= 90) score = 3;
  else score = 4;
  if (abducted || raised) score += 1;
  if (supported) score -= 1;
  return Math.max(1, score);
}

function rulaLowerArm(angle: number, crossesMidline: boolean): number {
  let score = (angle >= 60 && angle <= 100) ? 1 : 2;
  if (crossesMidline) score += 1;
  return score;
}

function rulaWrist(angle: number, deviation: boolean): number {
  let score: number;
  if (angle === 0) score = 1;
  else if (Math.abs(angle) <= 15) score = 2;
  else score = 3;
  if (deviation) score += 1;
  return score;
}

function rulaForceLoad(kg: number, shock: boolean): number {
  if (kg < 2) return 0;
  if (kg <= 10 && !shock) return 1;
  if (kg <= 10 && shock) return 2;
  return 3;
}

// RULA Table A (simplified): Upper Arm × Lower Arm × Wrist × Wrist Twist
const RULA_TABLE_A: number[][][][] = [
  // Upper Arm 1
  [[[1,2],[2,2],[2,3]],[[2,2],[2,2],[3,3]]],
  // Upper Arm 2
  [[[2,3],[3,3],[3,4]],[[3,3],[3,3],[3,4]]],
  // Upper Arm 3
  [[[3,3],[4,4],[4,5]],[[3,4],[4,4],[4,5]]],
  // Upper Arm 4
  [[[4,4],[4,4],[5,5]],[[5,5],[5,5],[6,6]]],
  // Upper Arm 5
  [[[5,5],[5,5],[6,7]],[[6,6],[6,7],[7,7]]],
  // Upper Arm 6
  [[[7,7],[7,7],[7,8]],[[8,8],[8,8],[8,9]]],
];

// RULA Table B: Neck × Trunk × Legs
const RULA_TABLE_B: number[][][] = [
  // Neck 1
  [[1,3],[2,3],[3,4],[5,5],[6,6],[7,7]],
  // Neck 2
  [[2,3],[2,3],[4,5],[5,5],[6,7],[7,7]],
  // Neck 3
  [[3,3],[3,4],[4,5],[5,6],[6,7],[7,7]],
  // Neck 4
  [[5,5],[5,6],[6,7],[7,7],[7,7],[8,8]],
  // Neck 5
  [[7,7],[7,7],[7,8],[8,8],[8,8],[8,8]],
  // Neck 6
  [[8,8],[8,8],[8,8],[8,9],[9,9],[9,9]],
];

// RULA Grand Score Table C
const RULA_TABLE_C: number[][] = [
  [1,2,3,3,4,5,5],
  [2,2,3,4,4,5,5],
  [3,3,3,4,4,5,6],
  [3,3,3,4,5,6,6],
  [4,4,4,5,6,7,7],
  [4,4,5,6,6,7,7],
  [5,5,6,6,7,7,7],
  [5,5,6,7,7,7,7],
];

function rulaNeck(angle: number, sideBend: boolean, twist: boolean): number {
  let score: number;
  if (angle >= 0 && angle <= 10) score = 1;
  else if (angle <= 20) score = 2;
  else score = 3;
  if (angle < 0) score = 4; // extension
  if (sideBend) score += 1;
  if (twist) score += 1;
  return Math.min(score, 6);
}

function rulaTrunk(angle: number, sideBend: boolean, twist: boolean): number {
  let score: number;
  if (angle === 0) score = 1;
  else if (Math.abs(angle) <= 20) score = 2;
  else if (Math.abs(angle) <= 60) score = 3;
  else score = 4;
  if (sideBend) score += 1;
  if (twist) score += 1;
  return Math.min(score, 6);
}

export function calculateRULA(input: RULAInput): RULAResult {
  const ua = rulaUpperArm(input.upperArmAngle, input.upperArmAbducted, input.shoulderRaised, input.armSupported);
  const la = rulaLowerArm(input.lowerArmAngle, input.lowerArmCrossesMidline);
  const wr = rulaWrist(input.wristAngle, input.wristDeviation);
  const wt = input.wristTwist === 'mid-range' ? 0 : 1;

  // Table A lookup
  const uaI = Math.min(ua - 1, 5);
  const laI = Math.min(la - 1, 1);
  const wrI = Math.min(wr - 1, 2);
  const postureA = RULA_TABLE_A[uaI]?.[laI]?.[wrI]?.[wt] ?? 7;

  const muscleA = input.muscleUseStatic ? 1 : 0;
  const forceA = rulaForceLoad(input.forceLoadKg, input.forceShockOrRepetitive);
  const grandScoreA = postureA + muscleA + forceA;

  // Table B
  const nk = rulaNeck(input.neckAngle, input.neckSideBend, input.neckTwist);
  const tr = rulaTrunk(input.trunkAngle, input.trunkSideBend, input.trunkTwist);
  const lg = input.legsSupported ? 0 : 1;

  const nkI = Math.min(nk - 1, 5);
  const trI = Math.min(tr - 1, 5);
  const postureB = RULA_TABLE_B[nkI]?.[trI]?.[lg] ?? 7;

  const muscleB = input.muscleUseStatic ? 1 : 0;
  const forceB = rulaForceLoad(input.forceLoadKg, input.forceShockOrRepetitive);
  const grandScoreB = postureB + muscleB + forceB;

  // Table C
  const aI = Math.min(grandScoreA - 1, 7);
  const bI = Math.min(grandScoreB - 1, 6);
  const finalScore = RULA_TABLE_C[aI]?.[bI] ?? 7;

  let actionLevel: RULAResult['actionLevel'];
  let actionDescription: string;
  if (finalScore <= 2) {
    actionLevel = 1; actionDescription = 'Acceptable — posture is acceptable if not maintained or repeated for long periods';
  } else if (finalScore <= 4) {
    actionLevel = 2; actionDescription = 'Investigate further — change may be needed';
  } else if (finalScore <= 6) {
    actionLevel = 3; actionDescription = 'Investigate and change soon';
  } else {
    actionLevel = 4; actionDescription = 'Investigate and implement change immediately';
  }

  return {
    grandScoreA, grandScoreB, finalScore, actionLevel, actionDescription,
    provenance: {
      tool_type: 'RULA',
      source_class: 'peer_reviewed_published',
      regulatory_status: 'not_osha_formula',
      citation: 'McAtamney & Corlett (1993). RULA: A survey method for the investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 91-99.'
    }
  };
}


// ─── NIOSH Revised Lifting Equation ────────────────────────────────────

export interface NIOSHInput {
  actualLoadKg: number;          // weight of object being lifted
  horizontalDistanceCm: number;  // H: horizontal distance from midpoint of hand grasp to midpoint of ankles
  verticalDistanceCm: number;    // V: vertical location of hands at origin of lift
  verticalTravelCm: number;      // D: vertical travel distance
  asymmetryAngleDeg: number;     // A: angle of asymmetry (0-135)
  frequencyPerMin: number;       // F: average frequency of lifting
  durationHours: number;         // work duration category
  couplingQuality: 'good' | 'fair' | 'poor';
}

export interface NIOSHResult {
  rwl: number;           // Recommended Weight Limit in kg
  liftingIndex: number;  // LI = actual load / RWL
  riskLevel: 'Acceptable' | 'Increased Risk' | 'High Risk';
  riskDescription: string;
  multipliers: {
    LC: number; HM: number; VM: number; DM: number;
    AM: number; FM: number; CM: number;
  };
  provenance: {
    tool_type: string;
    source_class: string;
    regulatory_status: string;
    citation: string;
    limitations: string[];
  };
}

function getHM(H: number): number {
  if (H < 25) H = 25;
  if (H > 63) return 0;
  return 25 / H;
}

function getVM(V: number): number {
  if (V > 175) return 0;
  return 1 - 0.003 * Math.abs(V - 75);
}

function getDM(D: number): number {
  if (D < 25) D = 25;
  if (D > 175) return 0;
  return 0.82 + (4.5 / D);
}

function getAM(A: number): number {
  if (A > 135) return 0;
  return 1 - (0.0032 * A);
}

// Frequency multiplier table (simplified for common durations)
function getFM(freq: number, duration: number, V: number): number {
  // Simplified lookup — uses short duration (<1hr) as default
  const isLow = V < 75;
  if (duration <= 1) {
    if (freq <= 0.2) return 1.00;
    if (freq <= 1) return 0.97;
    if (freq <= 4) return 0.94;
    if (freq <= 6) return 0.91;
    if (freq <= 8) return 0.84;
    if (freq <= 10) return 0.75;
    if (freq <= 12) return 0.60;
    return isLow ? 0.42 : 0.27;
  } else if (duration <= 2) {
    if (freq <= 0.2) return 0.95;
    if (freq <= 1) return 0.92;
    if (freq <= 4) return 0.88;
    if (freq <= 6) return 0.84;
    if (freq <= 8) return 0.72;
    if (freq <= 10) return 0.60;
    if (freq <= 12) return 0.45;
    return isLow ? 0.27 : 0.15;
  } else {
    if (freq <= 0.2) return 0.85;
    if (freq <= 1) return 0.81;
    if (freq <= 4) return 0.75;
    if (freq <= 6) return 0.65;
    if (freq <= 8) return 0.55;
    if (freq <= 10) return 0.45;
    if (freq <= 12) return 0.27;
    return isLow ? 0.15 : 0.00;
  }
}

function getCM(quality: 'good' | 'fair' | 'poor', V: number): number {
  if (quality === 'good') return 1.00;
  if (quality === 'fair') return V < 75 ? 0.95 : 1.00;
  return V < 75 ? 0.90 : 0.90;
}

export function calculateNIOSH(input: NIOSHInput): NIOSHResult {
  const LC = 23; // Load constant in kg (51 lb converted)
  const HM = getHM(input.horizontalDistanceCm);
  const VM = getVM(input.verticalDistanceCm);
  const DM = getDM(input.verticalTravelCm);
  const AM = getAM(input.asymmetryAngleDeg);
  const FM = getFM(input.frequencyPerMin, input.durationHours, input.verticalDistanceCm);
  const CM = getCM(input.couplingQuality, input.verticalDistanceCm);

  const rwl = LC * HM * VM * DM * AM * FM * CM;
  const liftingIndex = rwl > 0 ? input.actualLoadKg / rwl : 999;

  let riskLevel: NIOSHResult['riskLevel'];
  let riskDescription: string;

  if (liftingIndex <= 1.0) {
    riskLevel = 'Acceptable';
    riskDescription = 'Lifting index <= 1.0: Task is within recommended limits for most healthy workers.';
  } else if (liftingIndex <= 3.0) {
    riskLevel = 'Increased Risk';
    riskDescription = `Lifting index ${liftingIndex.toFixed(2)}: Increased risk of low back injury. Engineering or administrative controls recommended.`;
  } else {
    riskLevel = 'High Risk';
    riskDescription = `Lifting index ${liftingIndex.toFixed(2)}: Significant risk. Immediate redesign of lifting task required.`;
  }

  return {
    rwl: Math.round(rwl * 100) / 100,
    liftingIndex: Math.round(liftingIndex * 100) / 100,
    riskLevel,
    riskDescription,
    multipliers: { LC, HM: Math.round(HM * 1000) / 1000, VM: Math.round(VM * 1000) / 1000, DM: Math.round(DM * 1000) / 1000, AM: Math.round(AM * 1000) / 1000, FM, CM },
    provenance: {
      tool_type: 'NIOSH_RLE',
      source_class: 'federal_agency_published',
      regulatory_status: 'niosh_reference_not_osha_standard',
      citation: 'Waters, Putz-Anderson, Garg & Fine (1993). Revised NIOSH equation for the design and evaluation of manual lifting tasks. Ergonomics, 36(7), 749-776.',
      limitations: [
        'Designed for two-handed symmetric/asymmetric lifting only',
        'Not valid for: one-handed lifts, seated/kneeling lifts, constrained spaces, unstable loads, wheelbarrows, shoveling',
        'LI = 1.0 is theoretical "safe" reference, not absolute guarantee',
        'Does not account for individual worker fitness or pre-existing conditions'
      ]
    }
  };
}
