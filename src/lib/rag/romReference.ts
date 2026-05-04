/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROM REFERENCE ENGINE — AAOS Norms + Clinical Triage Logic
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sources & Provenance:
 *   ROM Norms — Standard adult AAOS reference table (widely reproduced)
 *   Red Flags — Published shoulder/neck referral guidelines
 *   Triage Heuristics — Evidence-informed clinical decision rules
 *
 * IMPORTANT DESIGN NOTES:
 *   - ROM alone does NOT diagnose pathology
 *   - Age/sex-stratified norms are fragmented in literature; we use standard
 *     adult reference values with explicit provenance tags
 *   - Red flags trigger urgent referral regardless of ROM values
 *   - Heuristic thresholds are tagged as "heuristic_inference" not "guideline_cutoff"
 */

// ─── AAOS Standard Adult ROM Reference Values ──────────────────────────

export interface ROMNorm {
  joint: string;
  movement: string;
  normalDegrees: number;
  source: string;
  notes?: string;
}

export const AAOS_ROM_NORMS: ROMNorm[] = [
  // Cervical Spine
  { joint: 'Cervical Spine', movement: 'Extension', normalDegrees: 45, source: 'AAOS standard adult reference' },
  { joint: 'Cervical Spine', movement: 'Flexion', normalDegrees: 45, source: 'AAOS standard adult reference' },
  { joint: 'Cervical Spine', movement: 'Rotation', normalDegrees: 60, source: 'AAOS standard adult reference' },
  { joint: 'Cervical Spine', movement: 'Lateral Flexion', normalDegrees: 45, source: 'AAOS standard adult reference' },
  // Shoulder
  { joint: 'Shoulder', movement: 'Extension', normalDegrees: 60, source: 'AAOS standard adult reference' },
  { joint: 'Shoulder', movement: 'Flexion', normalDegrees: 180, source: 'AAOS standard adult reference', notes: 'Community studies show healthy adults often do not reach 180° — age/sex dependent' },
  { joint: 'Shoulder', movement: 'Abduction', normalDegrees: 180, source: 'AAOS standard adult reference' },
  { joint: 'Shoulder', movement: 'Adduction', normalDegrees: 40, source: 'AAOS standard adult reference' },
  { joint: 'Shoulder', movement: 'Internal Rotation', normalDegrees: 70, source: 'AAOS standard adult reference' },
  { joint: 'Shoulder', movement: 'External Rotation', normalDegrees: 90, source: 'AAOS standard adult reference', notes: '90° expectation does not reflect all healthy adults' },
  // Elbow
  { joint: 'Elbow', movement: 'Flexion', normalDegrees: 150, source: 'AAOS standard adult reference' },
  { joint: 'Elbow', movement: 'Extension', normalDegrees: 0, source: 'AAOS standard adult reference' },
  { joint: 'Elbow', movement: 'Supination', normalDegrees: 80, source: 'AAOS standard adult reference' },
  { joint: 'Elbow', movement: 'Pronation', normalDegrees: 80, source: 'AAOS standard adult reference' },
  // Wrist
  { joint: 'Wrist', movement: 'Extension', normalDegrees: 70, source: 'AAOS standard adult reference' },
  { joint: 'Wrist', movement: 'Flexion', normalDegrees: 80, source: 'AAOS standard adult reference' },
  { joint: 'Wrist', movement: 'Radial Deviation', normalDegrees: 20, source: 'AAOS standard adult reference' },
  { joint: 'Wrist', movement: 'Ulnar Deviation', normalDegrees: 30, source: 'AAOS standard adult reference' },
  // Hip
  { joint: 'Hip', movement: 'Extension', normalDegrees: 20, source: 'AAOS standard adult reference' },
  { joint: 'Hip', movement: 'Flexion', normalDegrees: 120, source: 'AAOS standard adult reference' },
  { joint: 'Hip', movement: 'Abduction', normalDegrees: 40, source: 'AAOS standard adult reference' },
  { joint: 'Hip', movement: 'Adduction', normalDegrees: 20, source: 'AAOS standard adult reference' },
  { joint: 'Hip', movement: 'Internal Rotation', normalDegrees: 45, source: 'AAOS standard adult reference' },
  { joint: 'Hip', movement: 'External Rotation', normalDegrees: 45, source: 'AAOS standard adult reference' },
  // Knee
  { joint: 'Knee', movement: 'Flexion', normalDegrees: 135, source: 'AAOS standard adult reference' },
  { joint: 'Knee', movement: 'Extension', normalDegrees: 0, source: 'AAOS standard adult reference' },
  // Ankle
  { joint: 'Ankle', movement: 'Plantarflexion', normalDegrees: 50, source: 'AAOS standard adult reference' },
  { joint: 'Ankle', movement: 'Dorsiflexion', normalDegrees: 20, source: 'AAOS standard adult reference' },
  { joint: 'Ankle', movement: 'Inversion', normalDegrees: 35, source: 'AAOS standard adult reference' },
  { joint: 'Ankle', movement: 'Eversion', normalDegrees: 15, source: 'AAOS standard adult reference' },
  // Toe
  { joint: 'MTP (Great Toe)', movement: 'Extension', normalDegrees: 70, source: 'AAOS standard adult reference' },
  { joint: 'MTP (Great Toe)', movement: 'Flexion', normalDegrees: 45, source: 'AAOS standard adult reference' },
];


// ─── Red Flags (Urgent Referral Triggers) ──────────────────────────────

export interface RedFlag {
  id: string;
  category: 'urgent' | 'serious';
  description: string;
  action: string;
  timeframe: string;
  source: string;
}

export const RED_FLAGS: RedFlag[] = [
  // Shoulder
  {
    id: 'rf_shoulder_infection',
    category: 'urgent',
    description: 'Suspected joint infection (hot, swollen, red joint with fever)',
    action: 'Same-day referral to emergency/orthopedics',
    timeframe: 'Immediate',
    source: 'Published shoulder referral guidelines'
  },
  {
    id: 'rf_shoulder_dislocation',
    category: 'urgent',
    description: 'Unreduced traumatic shoulder dislocation',
    action: 'Emergency department referral for reduction',
    timeframe: 'Immediate',
    source: 'Published shoulder referral guidelines'
  },
  {
    id: 'rf_unexplained_deformity',
    category: 'serious',
    description: 'Unexplained deformity, significant swelling or erythema',
    action: 'Urgent orthopedic assessment within 24-48 hours',
    timeframe: '24-48 hours',
    source: 'Published shoulder management guidance'
  },
  {
    id: 'rf_significant_weakness',
    category: 'serious',
    description: 'Significant weakness not explained by pain',
    action: 'Urgent neuromuscular assessment',
    timeframe: '1 week',
    source: 'Published shoulder management guidance'
  },
  {
    id: 'rf_malignancy_suspicion',
    category: 'urgent',
    description: 'History or suspicion of malignancy with new MSK symptoms',
    action: 'Urgent referral for imaging and specialist assessment',
    timeframe: '48 hours',
    source: 'Published shoulder management guidance'
  },
  {
    id: 'rf_systemic_symptoms',
    category: 'urgent',
    description: 'Systemic symptoms: fever, unexplained weight loss, night sweats, malaise',
    action: 'Urgent medical review — rule out infection, malignancy, inflammatory disease',
    timeframe: 'Immediate to 24 hours',
    source: 'Published shoulder/neck management guidance'
  },
  // Neck/Spine
  {
    id: 'rf_cervical_myelopathy',
    category: 'urgent',
    description: 'Signs of cervical myelopathy (gait disturbance, bilateral hand numbness, bladder/bowel dysfunction)',
    action: 'Urgent surgical/neurology referral',
    timeframe: 'Immediate',
    source: 'Physical therapy clinical practice guidelines for neck pain'
  },
  {
    id: 'rf_cauda_equina',
    category: 'urgent',
    description: 'Cauda equina syndrome signs (saddle anesthesia, bilateral leg weakness, bladder/bowel changes)',
    action: 'Emergency surgical referral',
    timeframe: 'Immediate — surgical emergency',
    source: 'Clinical practice guidelines for low back pain'
  },
  {
    id: 'rf_fracture_suspicion',
    category: 'urgent',
    description: 'Suspected fracture (trauma + localized bony tenderness + inability to weight-bear)',
    action: 'Imaging and orthopedic assessment',
    timeframe: 'Same day',
    source: 'General orthopedic referral guidelines'
  },
];


// ─── Clinical Triage Logic ─────────────────────────────────────────────

export interface TriageInput {
  joint: string;
  movement: string;
  measuredROM: number;
  painLevel: number;          // 0-10 NRS
  workInterference: 'none' | 'mild' | 'moderate' | 'severe';
  redFlagsPresent: string[];  // IDs from RED_FLAGS
  postureRiskPersistent: boolean;
  patientAge?: number;
  patientSex?: 'male' | 'female';
}

export interface TriageResult {
  referralRecommended: boolean;
  referralType: 'none' | 'PT/OT' | 'orthopedic' | 'emergency' | 'multidisciplinary';
  urgency: 'routine' | 'urgent' | 'emergent';
  reasoning: string[];
  ruleClass: 'red_flag_guideline' | 'heuristic_inference' | 'monitoring';
  romPercentOfNorm: number | null;
  clinicalActions: string[];
  provenance: {
    method: string;
    evidence_basis: string;
    limitations: string[];
  };
}

export function triageAssessment(input: TriageInput): TriageResult {
  const reasoning: string[] = [];
  const clinicalActions: string[] = [];

  // ─── Step 1: Red Flag Check (always first) ───
  if (input.redFlagsPresent.length > 0) {
    const flags = RED_FLAGS.filter(rf => input.redFlagsPresent.includes(rf.id));
    const hasUrgent = flags.some(f => f.category === 'urgent');

    reasoning.push(`Red flag(s) present: ${flags.map(f => f.description).join('; ')}`);
    flags.forEach(f => clinicalActions.push(f.action));

    return {
      referralRecommended: true,
      referralType: hasUrgent ? 'emergency' : 'orthopedic',
      urgency: hasUrgent ? 'emergent' : 'urgent',
      reasoning,
      ruleClass: 'red_flag_guideline',
      romPercentOfNorm: null,
      clinicalActions,
      provenance: {
        method: 'Red flag screening per published clinical guidelines',
        evidence_basis: 'guideline_cutoff',
        limitations: ['Red flags override ROM-based triage', 'Clinical judgment required for borderline presentations']
      }
    };
  }

  // ─── Step 2: ROM Comparison to Norm ───
  const norm = AAOS_ROM_NORMS.find(n =>
    n.joint.toLowerCase().includes(input.joint.toLowerCase()) &&
    n.movement.toLowerCase().includes(input.movement.toLowerCase())
  );

  let romPercentOfNorm: number | null = null;
  let romDeficient = false;

  if (norm && norm.normalDegrees > 0) {
    romPercentOfNorm = (input.measuredROM / norm.normalDegrees) * 100;
    // Heuristic threshold: < 70% of reference norm
    if (romPercentOfNorm < 70) {
      romDeficient = true;
      reasoning.push(`ROM ${input.measuredROM}° is ${romPercentOfNorm.toFixed(0)}% of reference norm (${norm.normalDegrees}°) — below 70% threshold`);
    } else if (romPercentOfNorm < 85) {
      reasoning.push(`ROM ${input.measuredROM}° is ${romPercentOfNorm.toFixed(0)}% of reference — monitor for progression`);
    }
  }

  // ─── Step 3: Pain Assessment ───
  const painHigh = input.painLevel >= 6;
  if (painHigh) {
    reasoning.push(`Pain level ${input.painLevel}/10 exceeds clinical concern threshold (≥6/10)`);
  }

  // ─── Step 4: Work Interference ───
  const workImpacted = input.workInterference === 'moderate' || input.workInterference === 'severe';
  if (workImpacted) {
    reasoning.push(`Work interference rated as "${input.workInterference}" — functional impact present`);
  }

  // ─── Step 5: Posture Risk ───
  if (input.postureRiskPersistent) {
    reasoning.push('Persistent elevated posture risk score — ongoing ergonomic exposure');
  }

  // ─── Decision Logic ───
  const triggerCount = [romDeficient, painHigh, workImpacted, input.postureRiskPersistent].filter(Boolean).length;

  if (triggerCount >= 2 || (romDeficient && painHigh)) {
    clinicalActions.push('Refer for PT/OT evaluation');
    clinicalActions.push('Consider ergonomic workplace assessment');
    if (painHigh) clinicalActions.push('Pain management consultation if not responding to initial intervention');

    return {
      referralRecommended: true,
      referralType: triggerCount >= 3 ? 'multidisciplinary' : 'PT/OT',
      urgency: 'routine',
      reasoning,
      ruleClass: 'heuristic_inference',
      romPercentOfNorm,
      clinicalActions,
      provenance: {
        method: 'Multi-factor heuristic triage (ROM + pain + work interference + posture risk)',
        evidence_basis: 'heuristic_inference',
        limitations: [
          'Thresholds (70% ROM, 6/10 pain) are evidence-informed heuristics, not validated diagnostic cutoffs',
          'ROM varies by age and sex — standard adult norms may not apply to all populations',
          'Clinical judgment should override algorithmic recommendation where appropriate',
          'Does not replace physical examination or imaging'
        ]
      }
    };
  }

  if (triggerCount === 1) {
    clinicalActions.push('Monitor at next assessment (2-4 weeks)');
    clinicalActions.push('Provide self-management guidance and exercise prescription');
    if (input.postureRiskPersistent) clinicalActions.push('Prioritize ergonomic intervention');

    return {
      referralRecommended: false,
      referralType: 'none',
      urgency: 'routine',
      reasoning: [...reasoning, 'Single risk factor present — monitoring indicated'],
      ruleClass: 'monitoring',
      romPercentOfNorm,
      clinicalActions,
      provenance: {
        method: 'Multi-factor heuristic triage',
        evidence_basis: 'heuristic_inference',
        limitations: ['Single-factor findings may still warrant intervention based on clinical context']
      }
    };
  }

  return {
    referralRecommended: false,
    referralType: 'none',
    urgency: 'routine',
    reasoning: ['All measures within acceptable limits. Continue routine monitoring.'],
    ruleClass: 'monitoring',
    romPercentOfNorm,
    clinicalActions: ['Continue routine surveillance', 'Repeat assessment per schedule'],
    provenance: {
      method: 'Multi-factor heuristic triage',
      evidence_basis: 'heuristic_inference',
      limitations: ['Normal assessment does not preclude future pathology — maintain scheduled reassessment']
    }
  };
}


// ─── Neck Pain Guideline-Supported Treatment ───────────────────────────

export interface NeckPainTreatmentGuideline {
  presentation: string;
  recommendedInterventions: string[];
  evidenceLevel: string;
  source: string;
}

export const NECK_PAIN_GUIDELINES: NeckPainTreatmentGuideline[] = [
  {
    presentation: 'Neck pain with mobility deficits (no red flags)',
    recommendedInterventions: [
      'Thoracic manipulation/mobilization',
      'Cervical range of motion exercises',
      'Scapulothoracic and upper-extremity strengthening',
      'Patient education on prognosis and activity modification'
    ],
    evidenceLevel: 'Strong recommendation based on clinical practice guidelines',
    source: 'Physical therapy clinical practice guidelines for neck pain with mobility deficits'
  },
  {
    presentation: 'Neck pain with radiating arm symptoms',
    recommendedInterventions: [
      'Cervical traction (intermittent mechanical)',
      'Nerve mobilization techniques',
      'Cervical and thoracic manipulation',
      'Strengthening of deep cervical flexors and scapular stabilizers'
    ],
    evidenceLevel: 'Moderate recommendation',
    source: 'Physical therapy clinical practice guidelines'
  },
  {
    presentation: 'Chronic neck pain with movement coordination impairments',
    recommendedInterventions: [
      'Motor control exercises targeting deep cervical flexors',
      'Progressive strengthening program',
      'Ergonomic modification counseling',
      'Graded activity and return-to-work planning'
    ],
    evidenceLevel: 'Moderate recommendation',
    source: 'Physical therapy clinical practice guidelines'
  }
];
