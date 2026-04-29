import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DemoProvider } from './store/DemoContext';
import { Home } from './pages/Home';
import { QRScan } from './pages/QRScan';
import { LandingPage } from './pages/LandingPage';
import { InterestForm } from './pages/InterestForm';
import { AIAnalysis } from './pages/AIAnalysis';
import { Communications } from './pages/Communications';
import { WorkflowMap } from './pages/WorkflowMap';
import { Dashboard } from './pages/Dashboard';
import { Scheduling } from './pages/Scheduling';
import { HRDashboard } from './pages/HRDashboard';
import { StaffAssessment } from './pages/StaffAssessment';
import { CompanyAudit } from './pages/CompanyAudit';
import { StaffAudit } from './pages/assessments/StaffAudit';
import { ManagementAudit } from './pages/assessments/ManagementAudit';
import { HRAudit } from './pages/assessments/HRAudit';
import { AdminPanel } from './pages/AdminPanel';
import { RoleLogin } from './pages/RoleLogin';
import { useDemo } from './store/DemoContext';
import { Activity, LayoutDashboard, Map, QrCode, ArrowLeft, Users, ShieldAlert, BarChart3, LogOut, User, Settings } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { currentUser, logout } = useDemo();
  
  if (!currentUser) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 w-full">
          <div className="flex w-full overflow-x-auto no-scrollbar items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group mr-6">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xl tracking-tight hidden md:inline">Clinic<span className="text-indigo-600 font-extrabold">Demo</span></span>
            </Link>
            
            <div className="flex space-x-1 sm:space-x-4 flex-1">
              {currentUser.role === 'Patient' ? (
                <Link
                  to="/qr"
                  className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname === '/qr' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Journey
                </Link>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      location.pathname === '/dashboard' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Clinic
                  </Link>
                  {['HR', 'Admin'].includes(currentUser.role) && (
                    <Link
                      to="/hr"
                      className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        location.pathname === '/hr' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      HR & Risk
                    </Link>
                  )}
                  {['Management', 'Admin', 'HR'].includes(currentUser.role) && (
                    <Link
                      to="/audit"
                      className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        location.pathname === '/audit' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Enterprise Audit
                    </Link>
                  )}
                  {currentUser.role === 'Admin' && (
                    <Link
                      to="/admin-panel"
                      className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        location.pathname === '/admin-panel' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/workflow"
                    className={`inline-flex items-center px-3 py-2 my-auto rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      location.pathname === '/workflow' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Map
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <User className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-black text-slate-700 uppercase">{currentUser.role}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { currentUser } = useDemo();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-1 flex flex-col">
          {!currentUser ? (
            <Routes>
              <Route path="*" element={<RoleLogin />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/qr" element={<QRScan />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/form" element={<InterestForm />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/scheduling" element={<Scheduling />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hr" element={<HRDashboard />} />
              
              <Route path="/assessment" element={<StaffAudit />} />
              <Route path="/mgmt-audit" element={<ManagementAudit />} />
              <Route path="/hr-audit" element={<HRAudit />} />
              
              <Route path="/audit" element={<CompanyAudit />} />
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
