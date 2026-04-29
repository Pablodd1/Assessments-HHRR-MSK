import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, mockPatients, Task, mockTasks, EmployeeRiskProfile, mockEmployeeRisks } from '../data/mockData';

export type UserRole = 'Patient' | 'Staff' | 'HR' | 'Management' | 'Admin';

// ─────────────────────────────────────────
// Clinical Assessment Types
// ─────────────────────────────────────────
export interface MSKRegion {
  name: string;
  painLevel: number; // 0-10
  stiffness: number; // 0-10
  limitedMotion: boolean;
  notes?: string;
}

export interface MSKAssessment {
  id: string;
  employeeId: string;
  assessmentDate: string;
  regions: MSKRegion[];
  totalRiskScore: number; // 0-100
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
  headTilt: number; // degrees deviation
  shoulderImbalance: number; // cm difference
  pelvicTilt: number; // degrees
  spinalAlignment: string; // 'Normal' | 'MildDeviation' | 'SignificantDeviation'
  riskZones: string[]; // ['neck', 'shoulders', 'lower_back']
  aiAnalysis: string;
  correctiveExercises: string[];
  overallPostureScore: number; // 0-100
}

export interface MotionCaptureSession {
  id: string;
  employeeId: string;
  assessmentDate: string;
  movementTests: {
    name: string;
    symmetryScore: number; // 0-100
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
  burnoutScore: number; // 0-100
  absenteeismIndex: number; // 0-100
  engagementScore: number; // 0-100
  mskRiskScore: number; // 0-100 (NEW - from clinical data)
  financialRiskScore: number; // 0-100
  complianceStatus: 'Compliant' | 'AtRisk' | 'NonCompliant';
  aiInsights: string[];
  predictiveAttritionRisk: number; // 0-100 probability
}

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
  bodyScanData?: any;
  lastAssessmentDate?: string;
  overallHealthScore: number; // 0-100
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  employeeId?: string;
}

// ─────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────
const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Robert Wilson',
    email: 'rwilson@company.com',
    department: 'Operations',
    position: 'Front Desk Lead',
    hireDate: '2022-03-15',
    riskProfile: {
      id: 'rp-1',
      employeeId: 'emp-1',
      lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
      turnoverRisk: 'High',
      burnoutScore: 78,
      absenteeismIndex: 65,
      engagementScore: 42,
      mskRiskScore: 72, // HIGH MSK risk - correlation with back pain
      financialRiskScore: 55,
      complianceStatus: 'Compliant',
      aiInsights: [
        'High burnout due to frequent double shifts',
        'MSK risk elevated - possible lower back issues',
        'Motivation dropped 30% since departmental restructuring'
      ],
      predictiveAttritionRisk: 82
    },
    clinicalAssessment: {
      id: 'ca-1',
      employeeId: 'emp-1',
      assessmentDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      assessorName: 'Self-Assessment',
      type: 'MSK_SCREEN',
      mskData: {
        id: 'msk-1',
        employeeId: 'emp-1',
        assessmentDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        regions: [
          { name: 'neck', painLevel: 3, stiffness: 4, limitedMotion: false, notes: 'Morning stiffness' },
          { name: 'shoulders', painLevel: 5, stiffness: 4, limitedMotion: true, notes: 'Right shoulder limited' },
          { name: 'lower_back', painLevel: 8, stiffness: 7, limitedMotion: true, notes: 'Chronic pain, worse after shifts' },
          { name: 'hips', painLevel: 4, stiffness: 3, limitedMotion: false },
          { name: 'knees', painLevel: 2, stiffness: 1, limitedMotion: false }
        ],
        totalRiskScore: 72,
        riskLevel: 'High',
        workRiskFactors: ['Prolonged standing', 'Repetitive lifting', 'Poor ergonomic setup'],
        activityLimitations: ['Difficulty lifting heavy objects', 'Reduced mobility after long shifts'],
        aiSummary: 'High MSK risk - lower back is primary concern. Work-related factors are significant contributors.',
        recommendations: ['Ergonomic assessment', 'Physical therapy referral', 'Lower back strengthening program'],
        followUpRecommended: true
      },
      clinicalNotes: 'Patient reports chronic lower back pain, aggravated by work. Recommending ergonomic eval.',
      aiSummary: 'High MSK risk profile. Lower back and shoulder show significant risk. Work ergonomics are a key contributor.',
      recommendedPrograms: ['Back Pain Management Program', 'Ergonomic Workstation Assessment'],
      status: 'completed'
    },
    lastAssessmentDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    overallHealthScore: 48
  },
  {
    id: 'emp-2',
    name: 'Sarah Jenkins',
    email: 'sjenkins@company.com',
    department: 'Operations',
    position: 'Area Supervisor',
    hireDate: '2020-06-01',
    riskProfile: {
      id: 'rp-2',
      employeeId: 'emp-2',
      lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
      turnoverRisk: 'Low',
      burnoutScore: 15,
      absenteeismIndex: 8,
      engagementScore: 92,
      mskRiskScore: 18,
      financialRiskScore: 20,
      complianceStatus: 'Compliant',
      aiInsights: [
        'Excellent engagement and performance',
        'Low MSK risk - no significant concerns',
        'Candidate for leadership development'
      ],
      predictiveAttritionRisk: 8
    },
    lastAssessmentDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    overallHealthScore: 89
  },
  {
    id: 'emp-3',
    name: 'Michael Chang',
    email: 'mchang@company.com',
    department: 'Food & Beverage',
    position: 'Server',
    hireDate: '2023-01-10',
    riskProfile: {
      id: 'rp-3',
      employeeId: 'emp-3',
      lastUpdated: new Date(Date.now() - 86400000 * 10).toISOString(),
      turnoverRisk: 'High',
      burnoutScore: 88,
      absenteeismIndex: 45,
      engagementScore: 22,
      mskRiskScore: 65,
      financialRiskScore: 70,
      complianceStatus: 'AtRisk',
      aiInsights: [
        'Critical burnout indicators',
        'High turnover probability - seeking new opportunities',
        'MSK risk in knees and ankles from prolonged standing',
        'Engagement at all-time low - immediate intervention needed'
      ],
      predictiveAttritionRisk: 91
    },
    clinicalAssessment: {
      id: 'ca-3',
      employeeId: 'emp-3',
      assessmentDate: new Date(Date.now() - 86400000 * 7).toISOString(),
      assessorName: 'Self-Assessment',
      type: '3D_MOTION',
      motionData: {
        id: 'mot-3',
        employeeId: 'emp-3',
        assessmentDate: new Date(Date.now() - 86400000 * 7).toISOString(),
        movementTests: [
          { name: 'Squat', symmetryScore: 58, romDegrees: 85, compensations: ['Knee valgus', 'Excessive forward lean'] },
          { name: 'Overhead reach', symmetryScore: 72, romDegrees: 165, compensations: [] },
          { name: 'Walking gait', symmetryScore: 61, romDegrees: 0, compensations: ['Left antalgic gait'] }
        ],
        overallMobilityScore: 63,
        asymmetryIndex: 22,
        aiAnalysis: 'Significant asymmetry detected. Left side showing compensation patterns. Knee and ankle mobility concerns.',
        riskFlags: ['Left knee valgus', 'Ankle mobility deficit', 'Hip flexor tightness']
      },
      clinicalNotes: 'Gait analysis shows left-side compensation. Knee pain reported after 6+ hour shifts.',
      aiSummary: 'Moderate-high MSK risk. Motion analysis reveals biomechanical inefficiencies that could lead to injury.',
      recommendedPrograms: ['Gait Correction Program', 'Lower Extremity Strengthening'],
      status: 'completed'
    },
    lastAssessmentDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    overallHealthScore: 41
  },
  {
    id: 'emp-4',
    name: 'Emily Rodriguez',
    email: 'erodriguez@company.com',
    department: 'HR',
    position: 'HR Manager',
    hireDate: '2019-09-15',
    riskProfile: {
      id: 'rp-4',
      employeeId: 'emp-4',
      lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString(),
      turnoverRisk: 'Low',
      burnoutScore: 28,
      absenteeismIndex: 12,
      engagementScore: 85,
      mskRiskScore: 22,
      financialRiskScore: 15,
      complianceStatus: 'Compliant',
      aiInsights: [
        'Stable risk profile',
        'MSK risk well within normal range',
        'Consider for stress management programs as manager'
      ],
      predictiveAttritionRisk: 12
    },
    lastAssessmentDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    overallHealthScore: 82
  },
  {
    id: 'emp-5',
    name: 'James Thompson',
    email: 'jthompson@company.com',
    department: 'Operations',
    position: 'Warehouse Associate',
    hireDate: '2021-11-20',
    riskProfile: {
      id: 'rp-5',
      employeeId: 'emp-5',
      lastUpdated: new Date(Date.now() - 86400000 * 4).toISOString(),
      turnoverRisk: 'Medium',
      burnoutScore: 52,
      absenteeismIndex: 38,
      engagementScore: 58,
      mskRiskScore: 81, // HIGH - warehouse work
      financialRiskScore: 45,
      complianceStatus: 'Compliant',
      aiInsights: [
        'High MSK risk due to physical nature of work',
        'Shoulder and lower back are primary concerns',
        'Ergonomic interventions could reduce risk by 30%'
      ],
      predictiveAttritionRisk: 45
    },
    clinicalAssessment: {
      id: 'ca-5',
      employeeId: 'emp-5',
      assessmentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
      assessorName: 'Self-Assessment',
      type: 'MSK_SCREEN',
      mskData: {
        id: 'msk-5',
        employeeId: 'emp-5',
        assessmentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        regions: [
          { name: 'neck', painLevel: 4, stiffness: 5, limitedMotion: true, notes: 'After heavy lifting' },
          { name: 'shoulders', painLevel: 7, stiffness: 6, limitedMotion: true, notes: 'Right rotator cuff strain history' },
          { name: 'lower_back', painLevel: 9, stiffness: 8, limitedMotion: true, notes: 'Acute flare-up, lifting incident 2 weeks ago' },
          { name: 'hips', painLevel: 3, stiffness: 2, limitedMotion: false },
          { name: 'knees', painLevel: 6, stiffness: 5, limitedMotion: false, notes: 'Crepitus noted' }
        ],
        totalRiskScore: 81,
        riskLevel: 'High',
        workRiskFactors: ['Heavy lifting', 'Repetitive motions', 'Prolonged standing', 'Twisting movements'],
        activityLimitations: ['Cannot lift >20lbs currently', 'Limited bending'],
        aiSummary: 'Critical MSK risk. Lower back is severe. Immediate medical evaluation recommended. High risk of chronicity.',
        recommendations: ['Urgent medical evaluation', 'Work restrictions', 'Physical therapy', 'Ergonomic reassessment'],
        followUpRecommended: true
      },
      clinicalNotes: 'Recent lifting injury. Patient on light duty. Recommending MD follow-up.',
      aiSummary: 'High MSK risk with acute injury. Lower back risk is critical. Needs medical follow-up.',
      recommendedPrograms: ['Acute Back Injury Protocol', 'Work Hardening Program'],
      status: 'pending'
    },
    lastAssessmentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    overallHealthScore: 35
  }
];

// ─────────────────────────────────────────
// Context Interface
// ─────────────────────────────────────────
interface DemoContextType {
  // Employees (both patients and staff)
  employees: Employee[];
  getEmployee: (id: string) => Employee | undefined;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  updateRiskProfile: (employeeId: string, data: Partial<RiskProfile>) => void;
  addClinicalAssessment: (employeeId: string, assessment: ClinicalAssessment) => void;

  // Legacy patient/task support
  patients: Patient[];
  currentPatient: Partial<Patient>;
  setCurrentPatient: (patient: Partial<Patient>) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;

  // HR Risk
  employeeRisks: EmployeeRiskProfile[];
  updateEmployeeRisk: (id: string, data: Partial<EmployeeRiskProfile>) => void;

  // User
  currentUser: AppUser | null;
  loginAs: (role: UserRole, employeeId?: string) => void;
  logout: () => void;
  resetDemo: () => void;

  // Computed stats
  companyHealthScore: number;
  criticalRiskCount: number;
  avgMSKRisk: number;
  avgBurnoutScore: number;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [employeeRisks, setEmployeeRisks] = useState<EmployeeRiskProfile[]>(mockEmployeeRisks);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({ source: 'Front Desk QR' });

  // Computed stats
  const companyHealthScore = Math.round(
    employees.reduce((acc, e) => acc + e.overallHealthScore, 0) / employees.length
  );
  const criticalRiskCount = employees.filter(e =>
    e.riskProfile.turnoverRisk === 'High' || e.riskProfile.turnoverRisk === 'Critical'
  ).length;
  const avgMSKRisk = Math.round(
    employees.reduce((acc, e) => acc + e.riskProfile.mskRiskScore, 0) / employees.length
  );
  const avgBurnoutScore = Math.round(
    employees.reduce((acc, e) => acc + e.riskProfile.burnoutScore, 0) / employees.length
  );

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const updateRiskProfile = (employeeId: string, data: Partial<RiskProfile>) => {
    setEmployees(prev => prev.map(e =>
      e.id === employeeId ? { ...e, riskProfile: { ...e.riskProfile, ...data } } : e
    ));
  };

  const addClinicalAssessment = (employeeId: string, assessment: ClinicalAssessment) => {
    setEmployees(prev => prev.map(e =>
      e.id === employeeId ? { ...e, clinicalAssessment: assessment, lastAssessmentDate: assessment.assessmentDate } : e
    ));
  };

  const loginAs = (role: UserRole, employeeId?: string) => {
    const names: Record<UserRole, string> = {
      Patient: 'Demo Patient',
      Staff: 'Demo Staff',
      HR: 'HR Demo',
      Management: 'Management Demo',
      Admin: 'Admin Demo'
    };
    setCurrentUser({
      id: `u-${Math.random().toString(36).substr(2, 5)}`,
      name: names[role],
      role,
      email: `${role.toLowerCase()}@company.com`,
      employeeId: role === 'Patient' ? 'emp-1' : employeeId
    });
  };

  const logout = () => setCurrentUser(null);

  const addPatient = (patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const updateEmployeeRisk = (id: string, data: Partial<EmployeeRiskProfile>) => {
    setEmployeeRisks(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const resetDemo = () => {
    setCurrentPatient({ source: 'Front Desk QR' });
  };

  return (
    <DemoContext.Provider value={{
      employees, getEmployee, updateEmployee, updateRiskProfile, addClinicalAssessment,
      patients, currentPatient, setCurrentPatient, addPatient, updatePatient,
      tasks, addTask, updateTask,
      employeeRisks, updateEmployeeRisk,
      currentUser, loginAs, logout, resetDemo,
      companyHealthScore, criticalRiskCount, avgMSKRisk, avgBurnoutScore
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
};
