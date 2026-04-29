// ─────────────────────────────────────────
// Clinical Assessment Types
// ─────────────────────────────────────────

export interface MSKRegion {
  name: string;
  painLevel: number;      // 0–10
  stiffness: number;      // 0–10
  limitedMotion: boolean;
  notes?: string;
}

export interface MSKAssessment {
  id: string;
  employeeId: string;
  assessmentDate: string;
  regions: MSKRegion[];
  totalRiskScore: number; // 0–100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  workRiskFactors: string[];
  activityLimitations: string[];
  aiSummary: string;
  recommendations: string[];
  followUpRecommended: boolean;
}

export interface PosturePhoto {
  id: string;
  type: 'front' | 'left_side' | 'right_side';
  photoUrl: string;
  capturedAt: string;
}

export interface PostureAnalysis {
  id: string;
  employeeId: string;
  assessmentDate: string;
  photos: PosturePhoto[];
  headTilt: number;
  shoulderImbalance: number;
  pelvicTilt: number;
  spinalAlignment: 'Normal' | 'MildDeviation' | 'SignificantDeviation';
  riskZones: string[];
  aiAnalysis: string;
  correctiveExercises: string[];
  overallPostureScore: number;
}

export interface MotionCaptureSession {
  id: string;
  employeeId: string;
  assessmentDate: string;
  movementTests: {
    name: string;
    symmetryScore: number;
    romDegrees: number;
    compensations: string[];
  }[];
  overallMobilityScore: number;
  asymmetryIndex: number;
  aiAnalysis: string;
  riskFlags: string[];
}

export interface ClinicalAssessment {
  id: string;
  employeeId: string;
  assessmentDate: string;
  assessorName: string;
  type: 'MSK_SCREEN' | '3D_MOTION' | 'POSTURE' | 'FUNCTIONAL' | 'ANNUAL';
  mskData?: MSKAssessment;
  postureData?: PostureAnalysis;
  motionData?: MotionCaptureSession;
  clinicalNotes: string;
  aiSummary: string;
  recommendedPrograms: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
}

// ─────────────────────────────────────────
// Risk Profile Types
// ─────────────────────────────────────────

export interface RiskProfile {
  id: string;
  employeeId: string;
  lastUpdated: string;
  turnoverRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  burnoutScore: number;          // 0–100
  absenteeismIndex: number;      // 0–100
  engagementScore: number;       // 0–100
  mskRiskScore: number;          // 0–100
  financialRiskScore: number;    // 0–100
  complianceStatus: 'Compliant' | 'AtRisk' | 'NonCompliant';
  aiInsights: string[];
  predictiveAttritionRisk: number; // 0–100 probability
}

// ─────────────────────────────────────────
// Employee
// ─────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  avatar?: string;
  riskProfile: RiskProfile;
  clinicalAssessment?: ClinicalAssessment;
  bodyScanData?: unknown;
  lastAssessmentDate?: string;
  overallHealthScore: number; // 0–100
}

// ─────────────────────────────────────────
// App User
// ─────────────────────────────────────────

export type UserRole = 'Patient' | 'Staff' | 'HR' | 'Management' | 'Admin';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  employeeId?: string;
}
