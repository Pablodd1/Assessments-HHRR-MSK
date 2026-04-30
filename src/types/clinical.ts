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

export interface MovementTest {
  name: string;
  symmetryScore: number;
  romDegrees: number;
  compensations: string[];
}

export interface MotionCaptureSession {
  id: string;
  employeeId: string;
  assessmentDate: string;
  movementTests: MovementTest[];
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

// ─────────────────────────────────────────
// Intervention Types
// ─────────────────────────────────────────

export type InterventionType = 'MSK Management' | 'Acute Care' | 'Mobility' | 'Wellness' | 'Mental Health' | 'Ergonomic';
export type InterventionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface InterventionOutcome {
  date: string;
  type: 'milestone' | 'note' | 'completion';
  description: string;
}

export interface Intervention {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: InterventionType;
  program: string;
  status: InterventionStatus;
  startDate: string;
  targetEndDate?: string;
  progress: number; // 0–100
  nextSession?: string;
  aiRecommended: boolean;
  outcomes: InterventionOutcome[];
  assignedTo?: string;
  notes?: string;
}

export interface NewInterventionPayload {
  employeeId: string;
  type: InterventionType;
  program: string;
  targetEndDate?: string;
  assignedTo?: string;
}

// ─────────────────────────────────────────
// Compliance & Regulatory Types
// ─────────────────────────────────────────

export type ReportType = 'Compliance' | 'Risk' | 'Wellness' | 'Safety' | 'OSHA' | 'WorkersComp';
export type ReportStatus = 'Compliant' | 'At Risk' | 'Non-Compliant' | 'Pending Review' | 'Reviewed';

export interface ComplianceReport {
  id: string;
  name: string;
  description: string;
  generated: string;
  type: ReportType;
  status: ReportStatus;
  pages: number;
  generatedBy?: string;
  data?: Record<string, unknown>;
}

export interface OSHAIncidentRecord {
  id: string;
  employeeId: string;
  date: string;
  type: string;
  bodyPart: string;
  cause: string;
  oshaRecordable: boolean;
  daysAway: number;
  restrictedDays: number;
  notes?: string;
}

export interface WorkerCompClaim {
  id: string;
  employeeId: string;
  incidentDate: string;
  claimType: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'Open' | 'Closed' | 'Disputed';
  bodyPart: string;
}

export interface ADAAccommodation {
  id: string;
  employeeId: string;
  requestDate: string;
  type: 'Workstation' | 'Schedule' | 'Equipment' | 'Leave' | 'Policy' | 'Other';
  description: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'Implemented';
  resolvedDate?: string;
  notes?: string;
}

// ─────────────────────────────────────────
// Company Overview Types
// ─────────────────────────────────────────

export interface DepartmentRiskSummary {
  name: string;
  employeeCount: number;
  avgRiskScore: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  departmentRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface RiskDistribution {
  low: number;      // count
  moderate: number; // count
  high: number;    // count
  critical: number; // count
}

// ─────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────
// HR Risk Legacy Types
// ─────────────────────────────────────────

export interface EmployeeRiskProfile {
  id: string;
  name: string;
  department: string;
  position: string;
  averageLateness: number;
  sickDaysLastQuarter: number;
  performanceScore: number;
  motivationLevel: number;
  turnoverRisk: 'Low' | 'Medium' | 'High';
  lastAssessmentDate: string;
  notes: string;
  voiceIntake?: string;
  surveyResults?: {
    reasonForLate?: string;
    motivationDrivers?: string[];
    burnoutSymptoms?: string[];
  };
}
