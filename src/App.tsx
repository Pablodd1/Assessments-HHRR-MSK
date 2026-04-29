import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DemoProvider, useDemo } from './store/DemoContext';
import { RoleLogin } from './pages/RoleLogin';
import { Home } from './pages/Home';
import { QRScan } from './pages/QRScan';
import { LandingPage } from './pages/LandingPage';
import { InterestForm } from './pages/InterestForm';
import { AIAnalysis } from './pages/AIAnalysis';
import { Communications } from './pages/Communications';
import { WorkflowMap } from './pages/WorkflowMap';
import { Dashboard } from './pages/Dashboard';
import { HRDashboard } from './pages/HRDashboard';
import { CompanyAudit } from './pages/CompanyAudit';
import { StaffAssessment } from './pages/StaffAssessment';
import { CompanyAudit as CompanyAuditPage } from './pages/CompanyAudit';
import { StaffAudit } from './pages/assessments/StaffAudit';
import { ManagementAudit } from './pages/assessments/ManagementAudit';
import { HRAudit } from './pages/assessments/HRAudit';
import { AdminPanel } from './pages/AdminPanel';
// NEW Patient Assessment Pages
import { AssessmentHub } from './pages/patient/AssessmentHub';
import { MSKScreen } from './pages/patient/MSKScreen';
import { MotionCapture } from './pages/patient/MotionCapture';
import { PostureAnalysis } from './pages/patient/PostureAnalysis';
import { AssessmentResults } from './pages/patient/AssessmentResults';
import { AssessmentHistory } from './pages/patient/AssessmentHistory';
// NEW Admin Risk Pages
import { EmployeeRiskView } from './pages/admin/EmployeeRiskView';
import { ClinicalOverview } from './pages/admin/ClinicalOverview';
import { Interventions } from './pages/admin/Interventions';
import { ComplianceReports } from './pages/admin/ComplianceReports';
import { EnterpriseAudit } from './pages/admin/EnterpriseAudit';
import { useDemo } from './store/DemoContext';
import {
  Activity,
  LayoutDashboard,
  Map,
  QrCode,
  Users,
  ShieldAlert,
  BarChart3,
  LogOut,
  User,
  Settings,
  Scan,
  ActivitySquare,
  ScanLine,
  Camera,
  FileText,
  ChevronRight,
  HeartPulse,
  BrainCircuit,
  AlertTriangle
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { currentUser, logout } = useDemo();

  if (!currentUser) return null;

  const isPatient = currentUser.role === 'Patient';
  const isHR = ['HR', 'Admin'].includes(currentUser.role);
  const isManagement = ['Management', 'Admin', 'HR'].includes(currentUser.role);
  const isAdmin = currentUser.role === 'Admin';

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-8 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight hidden md:inline">
                HR<span className="text-indigo-400 font-extrabold">Clinical</span>
              </span>
            </Link>

            <div className="flex space-x-1">
              {/* Patient Navigation */}
              {isPatient ? (
                <>
                  <NavLink to="/assessment" icon={<Scan className="w-4 h-4" />} label="Assessments" current={location.pathname} />
                  <NavLink to="/history" icon={<FileText className="w-4 h-4" />} label="My History" current={location.pathname} />
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" current={location.pathname} />
                  {isHR && (
                    <NavLink to="/hr" icon={<Users className="w-4 h-4" />} label="HR & Risk" current={location.pathname} />
                  )}
                  {isHR && (
                    <NavLink to="/clinical" icon={<HeartPulse className="w-4 h-4" />} label="Clinical" current={location.pathname} />
                  )}
                  {isManagement && (
                    <NavLink to="/audit" icon={<BarChart3 className="w-4 h-4" />} label="Enterprise Audit" current={location.pathname} />
                  )}
                  {isManagement && (
                    <NavLink to="/interventions" icon={<BrainCircuit className="w-4 h-4" />} label="Interventions" current={location.pathname} />
                  )}
                  {isAdmin && (
                    <NavLink to="/reports" icon={<ShieldAlert className="w-4 h-4" />} label="Compliance" current={location.pathname} />
                  )}
                  <NavLink to="/workflow" icon={<Map className="w-4 h-4" />} label="Workflow" current={location.pathname} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
              <User className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase">{currentUser.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label, current }: { to: string; icon: React.ReactNode; label: string; current: string }) => (
  <Link
    to={to}
    className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
      current === to
        ? 'bg-indigo-600 text-white'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </Link>
);

const AppContent = () => {
  const { currentUser } = useDemo();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navigation />
        <main className="flex-1 flex flex-col">
          {!currentUser ? (
            <Routes>
              <Route path="*" element={<RoleLogin />} />
            </Routes>
          ) : (
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />
              <Route path="/qr" element={<QRScan />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/form" element={<InterestForm />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/scheduling" element={<></>} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hr" element={<HRDashboard />} />

              {/* Patient Assessment Routes */}
              <Route path="/assessment" element={<AssessmentHub />} />
              <Route path="/msk-screen" element={<MSKScreen />} />
              <Route path="/3d-assessment" element={<MotionCapture />} />
              <Route path="/posture-analysis" element={<PostureAnalysis />} />
              <Route path="/results/:id" element={<AssessmentResults />} />
              <Route path="/history" element={<AssessmentHistory />} />

              {/* Admin Risk Routes */}
              <Route path="/audit" element={<CompanyAuditPage />} />
              <Route path="/enterprise-audit" element={<EnterpriseAudit />} />
              <Route path="/employee/:id" element={<EmployeeRiskView />} />
              <Route path="/clinical" element={<ClinicalOverview />} />
              <Route path="/interventions" element={<Interventions />} />
              <Route path="/reports" element={<ComplianceReports />} />

              {/* Legacy Routes */}
              <Route path="/assessment" element={<StaffAudit />} />
              <Route path="/mgmt-audit" element={<ManagementAudit />} />
              <Route path="/hr-audit" element={<HRAudit />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/workflow" element={<WorkflowMap />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <DemoProvider>
      <AppContent />
    </DemoProvider>
  );
}
