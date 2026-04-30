import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type UserRole = 'Patient' | 'Staff' | 'HR' | 'Management' | 'Admin';

const API_BASE = 'http://localhost:3000/api';

// ─────────────────────────────────────────
// Clinical Assessment Types
// ─────────────────────────────────────────
export interface MSKRegion {
  name: string;
  painLevel: number;
  stiffness: number;
  limitedMotion: boolean;
  notes?: string;
}

export interface MSKAssessment {
  id: string;
  employeeId: string;
  assessmentDate: string;
  regions: MSKRegion[];
  totalRiskScore: number;
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
  spinalAlignment: string;
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
  status?: 'pending' | 'completed' | 'reviewed';
}

export interface RiskProfile {
  id: string;
  employeeId: string;
  lastUpdated: string;
  turnoverRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  burnoutScore: number;
  absenteeismIndex: number;
  engagementScore: number;
  mskRiskScore: number;
  financialRiskScore: number;
  complianceStatus: 'Compliant' | 'AtRisk' | 'NonCompliant';
  aiInsights: string[];
  predictiveAttritionRisk: number;
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
  overallHealthScore: number;
  // HR Risks data
  turnover_risk?: string;
  motivation_level?: number;
  performance_score?: number;
  sick_days?: number;
  notes?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  employeeId?: string;
}

// Legacy types for compatibility
export interface Task {
  id: string;
  patientId?: string;
  patientName?: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interest: string;
  contactMethod: string;
  bestTime: string;
  source: string;
  status: 'New' | 'Analyzed' | 'Contacted' | 'Scheduled';
  intent: 'High' | 'Medium' | 'Low';
  leadScore: number;
  aiSummary: string;
  suggestedFollowUp: string;
  communications: {
    emails: { type: string; day: number; subject: string; body: string }[];
    sms: { type: string; body: string }[];
  };
  timeline: { date: string; event: string }[];
  appointmentClicked: boolean;
}

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

// ─────────────────────────────────────────
// Context Interface
// ─────────────────────────────────────────
interface DemoContextType {
  employees: Employee[];
  getEmployee: (id: string) => Employee | undefined;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  updateRiskProfile: (employeeId: string, data: Partial<RiskProfile>) => void;
  addClinicalAssessment: (employeeId: string, assessment: ClinicalAssessment) => void;
  refreshEmployees: () => Promise<void>;

  patients: Patient[];
  currentPatient: Partial<Patient>;
  setCurrentPatient: (patient: Partial<Patient>) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;

  employeeRisks: EmployeeRiskProfile[];
  updateEmployeeRisk: (id: string, data: Partial<EmployeeRiskProfile>) => void;
  refreshEmployeeRisks: () => Promise<void>;

  currentUser: AppUser | null;
  loginAs: (role: UserRole, employeeId?: string) => void;
  logout: () => void;
  resetDemo: () => void;

  companyHealthScore: number;
  criticalRiskCount: number;
  avgMSKRisk: number;
  avgBurnoutScore: number;

  loading: boolean;
  error: string | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Transform API employee data to match frontend interface
function transformEmployee(apiEmp: any): Employee {
  return {
    id: String(apiEmp.id),
    name: apiEmp.name,
    email: apiEmp.email,
    department: apiEmp.department,
    position: apiEmp.position,
    hireDate: apiEmp.hire_date,
    overallHealthScore: 75, // Default since not in DB
    riskProfile: {
      id: String(apiEmp.hrRisk?.id || apiEmp.id),
      employeeId: String(apiEmp.id),
      lastUpdated: apiEmp.hrRisk?.updated_at || new Date().toISOString(),
      turnoverRisk: (apiEmp.hrRisk?.turnover_risk as any) || 'Low',
      burnoutScore: Math.max(0, 100 - (apiEmp.hrRisk?.motivation_level || 70)),
      absenteeismIndex: Math.min(100, (apiEmp.hrRisk?.sick_days || 0) * 10),
      engagementScore: apiEmp.hrRisk?.motivation_level || 70,
      mskRiskScore: 30, // Default
      financialRiskScore: 25, // Default
      complianceStatus: 'Compliant',
      aiInsights: apiEmp.hrRisk?.notes ? [apiEmp.hrRisk.notes] : [],
      predictiveAttritionRisk: apiEmp.hrRisk?.turnover_risk === 'High' ? 75 : apiEmp.hrRisk?.turnover_risk === 'Medium' ? 45 : 15
    },
    turnover_risk: apiEmp.hrRisk?.turnover_risk,
    motivation_level: apiEmp.hrRisk?.motivation_level,
    performance_score: apiEmp.hrRisk?.performance_score,
    sick_days: apiEmp.hrRisk?.sick_days,
    notes: apiEmp.hrRisk?.notes
  };
}

function transformEmployeeRisk(apiEmp: any): EmployeeRiskProfile {
  return {
    id: String(apiEmp.id),
    name: apiEmp.name,
    department: apiEmp.department,
    position: apiEmp.position,
    averageLateness: 0,
    sickDaysLastQuarter: apiEmp.sick_days || 0,
    performanceScore: apiEmp.performance_score || 75,
    motivationLevel: apiEmp.motivation_level || 70,
    turnoverRisk: (apiEmp.turnover_risk as any) || 'Low',
    lastAssessmentDate: apiEmp.updated_at || new Date().toISOString(),
    notes: apiEmp.notes || '',
    surveyResults: {
      motivationDrivers: [],
      burnoutSymptoms: []
    }
  };
}

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeRisks, setEmployeeRisks] = useState<EmployeeRiskProfile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({ source: 'Front Desk QR' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from API
  const refreshEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      const transformed = Array.isArray(data) ? data.map(transformEmployee) : [];
      setEmployees(transformed);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch employee risks from API
  const refreshEmployeeRisks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/hr-risks`);
      if (!res.ok) throw new Error('Failed to fetch HR risks');
      const data = await res.json();
      const transformed = Array.isArray(data) ? data.map(transformEmployeeRisk) : [];
      setEmployeeRisks(transformed);
    } catch (err: any) {
      console.error('Error fetching HR risks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshEmployees();
    refreshEmployeeRisks();
  }, [refreshEmployees, refreshEmployeeRisks]);

  // Computed stats
  const companyHealthScore = employees.length > 0
    ? Math.round(employees.reduce((acc, e) => acc + e.overallHealthScore, 0) / employees.length)
    : 0;
  
  const criticalRiskCount = employeeRisks.filter(e =>
    e.turnoverRisk === 'High' || e.turnoverRisk === 'Critical'
  ).length;
  
  const avgMSKRisk = employees.length > 0
    ? Math.round(employees.reduce((acc, e) => acc + e.riskProfile.mskRiskScore, 0) / employees.length)
    : 0;
  
  const avgBurnoutScore = employees.length > 0
    ? Math.round(employees.reduce((acc, e) => acc + e.riskProfile.burnoutScore, 0) / employees.length)
    : 0;

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update employee');
      await refreshEmployees();
    } catch (err: any) {
      console.error('Error updating employee:', err);
      setError(err.message);
    }
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
      employeeId: role === 'Patient' ? '1' : employeeId
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

  const updateEmployeeRisk = async (id: string, data: Partial<EmployeeRiskProfile>) => {
    try {
      // Find the employee_id for this risk
      const employee = employees.find(e => e.id === id);
      if (!employee) return;
      
      const res = await fetch(`${API_BASE}/hr-risks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnover_risk: data.turnoverRisk,
          motivation_level: data.motivationLevel,
          performance_score: data.performanceScore,
          sick_days: data.sickDaysLastQuarter,
          notes: data.notes
        })
      });
      if (!res.ok) throw new Error('Failed to update HR risk');
      await refreshEmployeeRisks();
    } catch (err: any) {
      console.error('Error updating employee risk:', err);
      setError(err.message);
    }
  };

  const resetDemo = () => {
    setCurrentPatient({ source: 'Front Desk QR' });
  };

  return (
    <DemoContext.Provider value={{
      employees, getEmployee, updateEmployee, updateRiskProfile, addClinicalAssessment, refreshEmployees,
      patients, currentPatient, setCurrentPatient, addPatient, updatePatient,
      tasks, addTask, updateTask,
      employeeRisks, updateEmployeeRisk, refreshEmployeeRisks,
      currentUser, loginAs, logout, resetDemo,
      companyHealthScore, criticalRiskCount, avgMSKRisk, avgBurnoutScore,
      loading, error
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
