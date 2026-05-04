/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATED CLINICAL QUESTIONNAIRES — Evidence-Based Instruments
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Licensing Status (as of 2026):
 *   GAD-7:  Free/no permission required. Official text states no permission needed.
 *   DASS-21: Public domain. UNSW explicitly states public domain.
 *   PHQ-9:  No-fee/unrestricted download (Pfizer 2010 announcement).
 *           Must preserve official wording and attribution.
 *
 * NOT INCLUDED (licensing restrictions):
 *   Cornell CMDQ: Not safe for commercial embedding without permission.
 *   PROMIS: Requires HealthMeasures permission for commercial digital use.
 *   WHO-5: CC BY-NC-SA 3.0 — not unrestricted commercial.
 *
 * source_class = "validated_psychometric_instrument"
 */

// ─── GAD-7 (Generalized Anxiety Disorder 7-Item Scale) ─────────────────

export interface GAD7Response {
  // Each item scored 0-3: Not at all, Several days, More than half the days, Nearly every day
  nervousAnxious: 0 | 1 | 2 | 3;
  cantStopWorrying: 0 | 1 | 2 | 3;
  worryingTooMuch: 0 | 1 | 2 | 3;
  troubleRelaxing: 0 | 1 | 2 | 3;
  restless: 0 | 1 | 2 | 3;
  easilyAnnoyed: 0 | 1 | 2 | 3;
  afraidSomethingAwful: 0 | 1 | 2 | 3;
}

export interface GAD7Result {
  totalScore: number;
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
  clinicalAction: string;
  cutoffMet: boolean;  // Score >= 10 (optimized sensitivity 89%, specificity 82%)
  provenance: {
    instrument: string;
    validation: string;
    licensing: string;
    citation: string;
    diagnosticAccuracy: string;
  };
}

export const GAD7_QUESTIONS = [
  { id: 'nervousAnxious', text: 'Feeling nervous, anxious, or on edge' },
  { id: 'cantStopWorrying', text: 'Not being able to stop or control worrying' },
  { id: 'worryingTooMuch', text: 'Worrying too much about different things' },
  { id: 'troubleRelaxing', text: 'Trouble relaxing' },
  { id: 'restless', text: 'Being so restless that it\'s hard to sit still' },
  { id: 'easilyAnnoyed', text: 'Becoming easily annoyed or irritable' },
  { id: 'afraidSomethingAwful', text: 'Feeling afraid as if something awful might happen' },
] as const;

export const GAD7_RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
] as const;

export function scoreGAD7(responses: GAD7Response): GAD7Result {
  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0);

  let severity: GAD7Result['severity'];
  let clinicalAction: string;

  if (totalScore <= 4) {
    severity = 'Minimal';
    clinicalAction = 'No clinical action indicated. Monitor if concerns persist.';
  } else if (totalScore <= 9) {
    severity = 'Mild';
    clinicalAction = 'Monitor symptoms. Consider watchful waiting. Reassess at follow-up.';
  } else if (totalScore <= 14) {
    severity = 'Moderate';
    clinicalAction = 'Active intervention warranted. Consider cognitive behavioral therapy (CBT) or pharmacotherapy. Schedule follow-up within 2-4 weeks.';
  } else {
    severity = 'Severe';
    clinicalAction = 'Immediate clinical attention recommended. Consider combined CBT + pharmacotherapy. Assess functional impairment and safety. Specialist referral may be indicated.';
  }

  return {
    totalScore,
    severity,
    clinicalAction,
    cutoffMet: totalScore >= 10,
    provenance: {
      instrument: 'GAD-7',
      validation: 'Spitzer, Kroenke, Williams & Löwe (2006)',
      licensing: 'No permission required to reproduce, translate, display, or distribute',
      citation: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A Brief Measure for Assessing Generalized Anxiety Disorder. Arch Intern Med. 2006;166(10):1092-1097.',
      diagnosticAccuracy: 'Cutoff ≥10: Sensitivity 89%, Specificity 82% for GAD'
    }
  };
}


// ─── DASS-21 (Depression Anxiety Stress Scales - 21 Item) ──────────────

export interface DASS21Response {
  // Each item scored 0-3: Did not apply to me at all, Applied to me to some degree,
  // Applied to me a considerable degree, Applied to me very much or most of the time
  // Depression subscale items (items 3, 5, 10, 13, 16, 17, 21)
  depression: [number, number, number, number, number, number, number];
  // Anxiety subscale items (items 2, 4, 7, 9, 15, 19, 20)
  anxiety: [number, number, number, number, number, number, number];
  // Stress subscale items (items 1, 6, 8, 11, 12, 14, 18)
  stress: [number, number, number, number, number, number, number];
}

export interface DASS21Result {
  depression: { raw: number; scaled: number; severity: string; };
  anxiety: { raw: number; scaled: number; severity: string; };
  stress: { raw: number; scaled: number; severity: string; };
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  clinicalAction: string;
  provenance: {
    instrument: string;
    licensing: string;
    citation: string;
    note: string;
  };
}

export const DASS21_DEPRESSION_ITEMS = [
  { id: 'd1', text: 'I couldn\'t seem to experience any positive feeling at all' },
  { id: 'd2', text: 'I found it difficult to work up the initiative to do things' },
  { id: 'd3', text: 'I felt that I had nothing to look forward to' },
  { id: 'd4', text: 'I felt down-hearted and blue' },
  { id: 'd5', text: 'I was unable to become enthusiastic about anything' },
  { id: 'd6', text: 'I felt I wasn\'t worth much as a person' },
  { id: 'd7', text: 'I felt that life was meaningless' },
] as const;

export const DASS21_ANXIETY_ITEMS = [
  { id: 'a1', text: 'I was aware of dryness of my mouth' },
  { id: 'a2', text: 'I experienced breathing difficulty' },
  { id: 'a3', text: 'I experienced trembling (e.g., in the hands)' },
  { id: 'a4', text: 'I was worried about situations in which I might panic' },
  { id: 'a5', text: 'I felt I was close to panic' },
  { id: 'a6', text: 'I was aware of the action of my heart in the absence of physical exertion' },
  { id: 'a7', text: 'I felt scared without any good reason' },
] as const;

export const DASS21_STRESS_ITEMS = [
  { id: 's1', text: 'I found it hard to wind down' },
  { id: 's2', text: 'I tended to over-react to situations' },
  { id: 's3', text: 'I felt that I was using a lot of nervous energy' },
  { id: 's4', text: 'I found myself getting agitated' },
  { id: 's5', text: 'I found it difficult to relax' },
  { id: 's6', text: 'I was intolerant of anything that kept me from getting on with what I was doing' },
  { id: 's7', text: 'I felt that I was rather touchy' },
] as const;

export const DASS21_RESPONSE_OPTIONS = [
  { value: 0, label: 'Did not apply to me at all' },
  { value: 1, label: 'Applied to me to some degree, or some of the time' },
  { value: 2, label: 'Applied to me to a considerable degree, or a good part of time' },
  { value: 3, label: 'Applied to me very much, or most of the time' },
] as const;

function dass21DepSeverity(score: number): string {
  if (score <= 9) return 'Normal';
  if (score <= 13) return 'Mild';
  if (score <= 20) return 'Moderate';
  if (score <= 27) return 'Severe';
  return 'Extremely Severe';
}

function dass21AnxSeverity(score: number): string {
  if (score <= 7) return 'Normal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Severe';
  return 'Extremely Severe';
}

function dass21StressSeverity(score: number): string {
  if (score <= 14) return 'Normal';
  if (score <= 18) return 'Mild';
  if (score <= 25) return 'Moderate';
  if (score <= 33) return 'Severe';
  return 'Extremely Severe';
}

export function scoreDASS21(responses: DASS21Response): DASS21Result {
  const depRaw = responses.depression.reduce((s, v) => s + v, 0);
  const anxRaw = responses.anxiety.reduce((s, v) => s + v, 0);
  const strRaw = responses.stress.reduce((s, v) => s + v, 0);

  // DASS-21 scores are multiplied by 2 to match DASS-42 severity thresholds
  const depScaled = depRaw * 2;
  const anxScaled = anxRaw * 2;
  const strScaled = strRaw * 2;

  const depSev = dass21DepSeverity(depScaled);
  const anxSev = dass21AnxSeverity(anxScaled);
  const strSev = dass21StressSeverity(strScaled);

  // Overall risk based on worst subscale
  const severities = [depSev, anxSev, strSev];
  let overallRisk: DASS21Result['overallRisk'] = 'Low';
  if (severities.includes('Extremely Severe')) overallRisk = 'Critical';
  else if (severities.includes('Severe')) overallRisk = 'High';
  else if (severities.includes('Moderate')) overallRisk = 'Moderate';

  let clinicalAction: string;
  switch (overallRisk) {
    case 'Low':
      clinicalAction = 'No clinical intervention indicated. Continue monitoring.';
      break;
    case 'Moderate':
      clinicalAction = 'Consider stress management resources, EAP referral, or brief counseling intervention.';
      break;
    case 'High':
      clinicalAction = 'Clinical intervention recommended. Consider referral for psychological assessment and treatment.';
      break;
    case 'Critical':
      clinicalAction = 'Urgent clinical attention required. Immediate referral for psychological/psychiatric evaluation. Assess safety and suicidality if depression is critical.';
      break;
  }

  return {
    depression: { raw: depRaw, scaled: depScaled, severity: depSev },
    anxiety: { raw: anxRaw, scaled: anxScaled, severity: anxSev },
    stress: { raw: strRaw, scaled: strScaled, severity: strSev },
    overallRisk,
    clinicalAction,
    provenance: {
      instrument: 'DASS-21',
      licensing: 'Public domain. Official UNSW site states the DASS is in the public domain.',
      citation: 'Lovibond SH & Lovibond PF (1995). Manual for the Depression Anxiety Stress Scales (2nd ed.). Sydney: Psychology Foundation.',
      note: 'DASS-21 is a symptom severity instrument, not a stand-alone diagnostic tool. Scores indicate severity of core symptoms, not presence/absence of clinical disorder.'
    }
  };
}


// ─── PHQ-9 (Patient Health Questionnaire - 9) ──────────────────────────

export interface PHQ9Response {
  // Each item scored 0-3 over last 2 weeks
  littleInterest: 0 | 1 | 2 | 3;
  feelingDown: 0 | 1 | 2 | 3;
  sleepProblems: 0 | 1 | 2 | 3;
  tiredNoEnergy: 0 | 1 | 2 | 3;
  poorAppetite: 0 | 1 | 2 | 3;
  feelingBadAboutSelf: 0 | 1 | 2 | 3;
  troubleConcentrating: 0 | 1 | 2 | 3;
  movingSlowly: 0 | 1 | 2 | 3;
  thoughtsSelfHarm: 0 | 1 | 2 | 3;
  // Functional impairment question (not scored but clinically important)
  difficultyLevel?: 'not_difficult' | 'somewhat' | 'very' | 'extremely';
}

export interface PHQ9Result {
  totalScore: number;
  severity: 'None/Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';
  clinicalAction: string;
  majorDepressionLikely: boolean; // Score >= 10 (sensitivity 88%, specificity 88%)
  suicidalIdeationFlag: boolean;  // Item 9 > 0
  provenance: {
    instrument: string;
    validation: string;
    licensing: string;
    citation: string;
    diagnosticAccuracy: string;
  };
}

export const PHQ9_QUESTIONS = [
  { id: 'littleInterest', text: 'Little interest or pleasure in doing things' },
  { id: 'feelingDown', text: 'Feeling down, depressed, or hopeless' },
  { id: 'sleepProblems', text: 'Trouble falling or staying asleep, or sleeping too much' },
  { id: 'tiredNoEnergy', text: 'Feeling tired or having little energy' },
  { id: 'poorAppetite', text: 'Poor appetite or overeating' },
  { id: 'feelingBadAboutSelf', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
  { id: 'troubleConcentrating', text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
  { id: 'movingSlowly', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual' },
  { id: 'thoughtsSelfHarm', text: 'Thoughts that you would be better off dead or of hurting yourself in some way' },
] as const;

export const PHQ9_RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
] as const;

export function scorePHQ9(responses: PHQ9Response): PHQ9Result {
  const { difficultyLevel, ...scoredItems } = responses;
  const totalScore = Object.values(scoredItems).reduce((sum, val) => sum + (val as number), 0);

  let severity: PHQ9Result['severity'];
  let clinicalAction: string;

  if (totalScore <= 4) {
    severity = 'None/Minimal';
    clinicalAction = 'No treatment indicated. Monitor if patient has risk factors.';
  } else if (totalScore <= 9) {
    severity = 'Mild';
    clinicalAction = 'Watchful waiting. Repeat PHQ-9 at follow-up. Consider brief supportive counseling.';
  } else if (totalScore <= 14) {
    severity = 'Moderate';
    clinicalAction = 'Treatment plan indicated. Consider counseling, follow-up, and/or pharmacotherapy based on clinical judgment.';
  } else if (totalScore <= 19) {
    severity = 'Moderately Severe';
    clinicalAction = 'Active treatment with pharmacotherapy and/or psychotherapy. Close follow-up monitoring.';
  } else {
    severity = 'Severe';
    clinicalAction = 'Immediate initiation of pharmacotherapy. Consider combination with psychotherapy. Expedited referral to psychiatry if clinically indicated.';
  }

  const suicidalIdeationFlag = responses.thoughtsSelfHarm > 0;
  if (suicidalIdeationFlag) {
    clinicalAction += ' ⚠️ SAFETY FLAG: Patient endorsed thoughts of self-harm (Item 9). Conduct immediate safety assessment.';
  }

  return {
    totalScore,
    severity,
    clinicalAction,
    majorDepressionLikely: totalScore >= 10,
    suicidalIdeationFlag,
    provenance: {
      instrument: 'PHQ-9',
      validation: 'Kroenke, Spitzer & Williams (2001)',
      licensing: 'No-fee, unrestricted download per Pfizer 2010 announcement. Preserve official wording and attribution.',
      citation: 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: Validity of a Brief Depression Severity Measure. J Gen Intern Med. 2001;16(9):606-613.',
      diagnosticAccuracy: 'Cutoff ≥10: Sensitivity 88%, Specificity 88% for major depression'
    }
  };
}


// ─── Utility: Combined Mental Health Risk Score ─────────────────────────

export interface CombinedMentalHealthResult {
  gad7?: GAD7Result;
  dass21?: DASS21Result;
  phq9?: PHQ9Result;
  compositeRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  primaryConcerns: string[];
  recommendedActions: string[];
  workplaceImplications: string[];
}

export function combinedMentalHealthRisk(
  gad7?: GAD7Result,
  dass21?: DASS21Result,
  phq9?: PHQ9Result
): CombinedMentalHealthResult {
  const risks: string[] = [];
  const primaryConcerns: string[] = [];
  const recommendedActions: string[] = [];
  const workplaceImplications: string[] = [];

  if (gad7) {
    if (gad7.cutoffMet) risks.push('anxiety_clinical');
    if (gad7.severity === 'Moderate' || gad7.severity === 'Severe') {
      primaryConcerns.push(`Generalized Anxiety: ${gad7.severity} (score ${gad7.totalScore}/21)`);
      workplaceImplications.push('May impact concentration, decision-making, and interpersonal interactions');
    }
  }

  if (phq9) {
    if (phq9.majorDepressionLikely) risks.push('depression_clinical');
    if (phq9.suicidalIdeationFlag) risks.push('safety_flag');
    if (phq9.severity === 'Moderate' || phq9.severity === 'Moderately Severe' || phq9.severity === 'Severe') {
      primaryConcerns.push(`Depression: ${phq9.severity} (score ${phq9.totalScore}/27)`);
      workplaceImplications.push('May impact energy, motivation, absenteeism, and productivity');
    }
  }

  if (dass21) {
    if (dass21.overallRisk === 'High' || dass21.overallRisk === 'Critical') risks.push('dass_elevated');
    if (dass21.stress.severity === 'Severe' || dass21.stress.severity === 'Extremely Severe') {
      primaryConcerns.push(`Occupational Stress: ${dass21.stress.severity} (scaled score ${dass21.stress.scaled})`);
      workplaceImplications.push('High stress correlates with increased sick days, burnout risk, and turnover intention');
    }
  }

  let compositeRisk: CombinedMentalHealthResult['compositeRisk'] = 'Low';
  if (risks.includes('safety_flag')) {
    compositeRisk = 'Critical';
    recommendedActions.push('IMMEDIATE: Safety assessment and crisis intervention');
  } else if (risks.length >= 2 || risks.includes('depression_clinical')) {
    compositeRisk = 'High';
    recommendedActions.push('Referral to EAP or clinical psychologist within 1 week');
    recommendedActions.push('Consider workload adjustment during treatment period');
  } else if (risks.length === 1) {
    compositeRisk = 'Moderate';
    recommendedActions.push('Schedule follow-up assessment in 2-4 weeks');
    recommendedActions.push('Provide stress management / wellness resources');
  }

  if (compositeRisk !== 'Low') {
    recommendedActions.push('Document in confidential health record (HIPAA-compliant)');
    workplaceImplications.push('Consider reasonable accommodations per ADA if functional impairment persists');
  }

  return {
    gad7, dass21, phq9,
    compositeRisk,
    primaryConcerns,
    recommendedActions,
    workplaceImplications
  };
}
