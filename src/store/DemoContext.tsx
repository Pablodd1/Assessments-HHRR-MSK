import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, mockPatients, Task, mockTasks, EmployeeRiskProfile, mockEmployeeRisks } from '../data/mockData';

export type UserRole = 'Patient' | 'Staff' | 'HR' | 'Management' | 'Admin';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface DemoContextType {
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
  currentUser: AppUser | null;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

/**
 * Demo State Management Context
 * 
 * Provides a unified store for patients (leads) and tasks.
 * Uses React Context for simplicity in this demo.
 * 
 * SCALE TIP: For a multi-user production app, replace this local state with 
 * a persistent cloud database (e.g. Firebase Firestore) and a real-time sync mechanism.
 */
export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [employeeRisks, setEmployeeRisks] = useState<EmployeeRiskProfile[]>(mockEmployeeRisks);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({
    source: 'Front Desk QR'
  });

  const loginAs = (role: UserRole) => {
    setCurrentUser({
      id: `u-${Math.random().toString(36).substr(2, 5)}`,
      name: `Demo ${role}`,
      role: role,
      email: `${role.toLowerCase()}@clinic.demo`
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
      patients, 
      currentPatient, 
      setCurrentPatient, 
      addPatient, 
      updatePatient, 
      tasks, 
      addTask, 
      updateTask, 
      employeeRisks,
      updateEmployeeRisk,
      currentUser,
      loginAs,
      logout,
      resetDemo 
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
