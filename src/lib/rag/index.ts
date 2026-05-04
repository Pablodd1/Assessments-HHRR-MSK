/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RAG MODULE INDEX — Central Export for All Evidence-Based Engines
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Ergonomic Scoring (REBA, RULA, NIOSH RLE)
export {
  calculateREBA,
  calculateRULA,
  calculateNIOSH,
  type REBAInput,
  type REBAResult,
  type RULAInput,
  type RULAResult,
  type NIOSHInput,
  type NIOSHResult,
} from './ergonomicScoring';

// Validated Clinical Questionnaires (GAD-7, DASS-21, PHQ-9)
export {
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
  type GAD7Result,
  type DASS21Response,
  type DASS21Result,
  type PHQ9Response,
  type PHQ9Result,
  type CombinedMentalHealthResult,
} from './clinicalQuestionnaires';

// ROM Reference Engine & Clinical Triage
export {
  AAOS_ROM_NORMS,
  RED_FLAGS,
  NECK_PAIN_GUIDELINES,
  triageAssessment,
  type ROMNorm,
  type RedFlag,
  type TriageInput,
  type TriageResult,
  type NeckPainTreatmentGuideline,
} from './romReference';

// Employer Cost Engine (BLS-grounded)
export {
  BLS_COMPENSATION_2025,
  BLS_ABSENCE_RATES_2025,
  BLS_PAID_LEAVE_2025,
  WAGE_MULTIPLIERS,
  calculateEmployerCosts,
  calculateWPAI,
  calculateROI,
  getQuickCostEstimates,
  type CostInput,
  type CostResult,
  type ROIInput,
  type ROIResult,
} from './costEngine';

// HIPAA Compliance (45 CFR 164.312)
export {
  TECHNICAL_SAFEGUARDS,
  assessCompliance,
  getPlatformComplianceStatus,
  type TechnicalSafeguard,
  type ComplianceAssessmentItem,
  type ComplianceReport,
} from './hipaaCompliance';
