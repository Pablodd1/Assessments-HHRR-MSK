import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  Calendar,
  Lock,
  Eye,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Users,
  Stethoscope,
  Briefcase,
  Accessibility
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';
import type { ComplianceReport, OSHAIncidentRecord, WorkerCompClaim, ADAAccommodation } from '../../types/clinical';

const INITIAL_REPORTS: ComplianceReport[] = [
  {
    id: 'GDPR-2026-Q1',
    name: 'GDPR Compliance Report Q1 2026',
    description: 'Employee health data processing, consent records, and data subject requests',
    generated: '2026-03-31',
    type: 'Compliance',
    status: 'Compliant',
    pages: 24
  },
  {
    id: 'MSK-RISK-2026',
    name: 'MSK Risk Assessment Summary',
    description: 'Aggregate MSK risk data by department, role, and risk level',
    generated: '2026-04-28',
    type: 'Risk',
    status: 'Reviewed',
    pages: 12
  },
  {
    id: 'WELLNESS-2026-Q1',
    name: 'Wellness Program Effectiveness Q1',
    description: 'Intervention outcomes, program ROI, and participation rates',
    generated: '2026-04-15',
    type: 'Wellness',
    status: 'Compliant',
    pages: 18
  },
  {
    id: 'TURNOVER-RISK-2026',
    name: 'Predictive Turnover Risk Report',
    description: 'AI-generated attrition risk scores and recommended interventions',
    generated: '2026-04-28',
    type: 'Risk',
    status: 'Pending Review',
    pages: 8
  },
  {
    id: 'OSHA-2026',
    name: 'OSHA Workplace Safety Assessment',
    description: 'Ergonomic compliance, workplace injury data, and corrective actions',
    generated: '2026-04-01',
    type: 'OSHA',
    status: 'Compliant',
    pages: 32
  }
];

const MOCK_OSHA_RECORDS: OSHAIncidentRecord[] = [
  {
    id: 'osha-1',
    employeeId: 'emp-5',
    date: '2026-04-10',
    type: 'Strain',
    bodyPart: 'Lower Back',
    cause: 'Lifting heavy boxes',
    oshaRecordable: true,
    daysAway: 5,
    restrictedDays: 3,
    notes: 'Employee was lifting boxes weighing approximately 40 lbs'
  },
  {
    id: 'osha-2',
    employeeId: 'emp-1',
    date: '2026-03-15',
    type: 'Repetitive Motion',
    bodyPart: 'Right Shoulder',
    cause: 'Repetitive overhead work',
    oshaRecordable: false,
    daysAway: 0,
    restrictedDays: 2,
    notes: 'Physical therapy prescribed'
  },
  {
    id: 'osha-3',
    employeeId: 'emp-3',
    date: '2026-02-20',
    type: 'Slip/Fall',
    bodyPart: 'Left Ankle',
    cause: 'Wet floor in kitchen area',
    oshaRecordable: true,
    daysAway: 3,
    restrictedDays: 1,
    notes: 'Floor warning sign was not displayed'
  }
];

const MOCK_WORKERS_COMP: WorkerCompClaim[] = [
  {
    id: 'wc-1',
    employeeId: 'emp-5',
    incidentDate: '2026-04-10',
    claimType: 'Back Injury',
    estimatedCost: 8500,
    actualCost: undefined,
    status: 'Open',
    bodyPart: 'Lower Back'
  },
  {
    id: 'wc-2',
    employeeId: 'emp-3',
    incidentDate: '2026-02-20',
    claimType: 'Slip/Fall',
    estimatedCost: 4200,
    actualCost: 3800,
    status: 'Closed',
    bodyPart: 'Left Ankle'
  },
  {
    id: 'wc-3',
    employeeId: 'emp-1',
    incidentDate: '2026-03-15',
    claimType: 'Repetitive Strain',
    estimatedCost: 2500,
    actualCost: undefined,
    status: 'Open',
    bodyPart: 'Right Shoulder'
  }
];

const MOCK_ADA_ACCOMMODATIONS: ADAAccommodation[] = [
  {
    id: 'ada-1',
    employeeId: 'emp-1',
    requestDate: '2026-03-01',
    type: 'Workstation',
    description: 'Adjustable standing desk and ergonomic chair',
    status: 'Implemented',
    resolvedDate: '2026-03-15',
    notes: 'Employee reports significant improvement in comfort'
  },
  {
    id: 'ada-2',
    employeeId: 'emp-5',
    requestDate: '2026-04-12',
    type: 'Schedule',
    description: 'Modified work schedule to accommodate physical therapy appointments',
    status: 'Approved',
    notes: 'Approved for 3 months with review'
  },
  {
    id: 'ada-3',
    employeeId: 'emp-3',
    requestDate: '2026-04-20',
    type: 'Equipment',
    description: 'Anti-fatigue mat and proper footwear allowance',
    status: 'Pending',
    notes: 'Requested due to prolonged standing requirements'
  }
];

const getReportTypeColor = (type: string): { bg: string; text: string } => {
  switch (type) {
    case 'Compliance': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
    case 'Risk': return { bg: 'bg-red-50', text: 'text-red-600' };
    case 'Wellness': return { bg: 'bg-indigo-50', text: 'text-indigo-600' };
    case 'Safety': return { bg: 'bg-amber-50', text: 'text-amber-600' };
    case 'OSHA': return { bg: 'bg-blue-50', text: 'text-blue-600' };
    case 'WorkersComp': return { bg: 'bg-violet-50', text: 'text-violet-600' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600' };
  }
};

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'Compliant':
    case 'Approved':
    case 'Implemented':
    case 'Closed':
      return 'bg-emerald-100 text-emerald-700';
    case 'Reviewed':
    case 'At Risk':
      return 'bg-indigo-100 text-indigo-700';
    case 'Pending Review':
    case 'Pending':
    case 'Open':
      return 'bg-amber-100 text-amber-700';
    case 'Non-Compliant':
    case 'Denied':
    case 'Disputed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

type TabType = 'overview' | 'osha' | 'workerscomp' | 'ada' | 'reports';

export const ComplianceReports = () => {
  const { employees } = useDemo();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [reports] = useState<ComplianceReport[]>(INITIAL_REPORTS);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const compliant = employees.filter(e => e.riskProfile.complianceStatus === 'Compliant').length;
  const atRisk = employees.filter(e => e.riskProfile.complianceStatus === 'AtRisk').length;
  const nonCompliant = employees.filter(e => e.riskProfile.complianceStatus === 'NonCompliant').length;

  // OSHA Prediction - Based on high-risk MSK employees
  const oshaPrediction = useMemo(() => {
    const highRiskCount = employees.filter(e => e.riskProfile.mskRiskScore >= 70).length;
    const moderateRiskCount = employees.filter(e => e.riskProfile.mskRiskScore >= 40 && e.riskProfile.mskRiskScore < 70).length;
    const totalIncidentsLastYear = MOCK_OSHA_RECORDS.filter(r => r.oshaRecordable).length;
    const predictedIncidents = Math.round((highRiskCount * 0.15) + (moderateRiskCount * 0.05));
    const riskLevel = predictedIncidents > 3 ? 'High' : predictedIncidents > 1 ? 'Moderate' : 'Low';

    return {
      predictedIncidents,
      riskLevel,
      highRiskCount,
      moderateRiskCount,
      totalIncidentsLastYear
    };
  }, [employees]);

  // Workers Comp Cost Estimation
  const workersCompEstimation = useMemo(() => {
    const highRiskEmployees = employees.filter(e => e.riskProfile.mskRiskScore >= 70);
    const avgClaimCost = 5000;
    const estimatedCosts = highRiskEmployees.map(e => ({
      employeeId: e.id,
      name: e.name,
      estimatedRisk: e.riskProfile.mskRiskScore,
      estimatedClaimCost: Math.round((e.riskProfile.mskRiskScore / 100) * avgClaimCost * 1.2)
    }));

    const totalEstimated = estimatedCosts.reduce((sum, e) => sum + e.estimatedClaimCost, 0);
    const totalActual = MOCK_WORKERS_COMP.reduce((sum, c) => sum + (c.actualCost || c.estimatedCost), 0);

    return {
      highRiskCount: highRiskEmployees.length,
      estimatedCosts,
      totalEstimated,
      totalActual,
      openClaims: MOCK_WORKERS_COMP.filter(c => c.status === 'Open').length
    };
  }, [employees]);

  const handleExportCSV = (type: 'osha' | 'workerscomp' | 'ada') => {
    let data: string[][] = [];
    let filename = '';

    switch (type) {
      case 'osha':
        filename = 'osha_records_export.csv';
        data = [
          ['ID', 'Employee ID', 'Date', 'Type', 'Body Part', 'Cause', 'OSHA Recordable', 'Days Away', 'Restricted Days'],
          ...MOCK_OSHA_RECORDS.map(r => [
            r.id, r.employeeId, r.date, r.type, r.bodyPart, r.cause,
            r.oshaRecordable ? 'Yes' : 'No', String(r.daysAway), String(r.restrictedDays)
          ])
        ];
        break;
      case 'workerscomp':
        filename = 'workers_comp_export.csv';
        data = [
          ['ID', 'Employee ID', 'Incident Date', 'Claim Type', 'Body Part', 'Estimated Cost', 'Actual Cost', 'Status'],
          ...MOCK_WORKERS_COMP.map(c => [
            c.id, c.employeeId, c.incidentDate, c.claimType, c.bodyPart,
            String(c.estimatedCost), c.actualCost ? String(c.actualCost) : 'N/A', c.status
          ])
        ];
        break;
      case 'ada':
        filename = 'ada_accommodations_export.csv';
        data = [
          ['ID', 'Employee ID', 'Request Date', 'Type', 'Description', 'Status', 'Resolved Date'],
          ...MOCK_ADA_ACCOMMODATIONS.map(a => [
            a.id, a.employeeId, a.requestDate, a.type, a.description, a.status, a.resolvedDate || 'N/A'
          ])
        ];
        break;
    }

    const csv = data.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePDF = () => {
    // Simulated PDF generation
    const reportContent = `
COMPLIANCE REPORT SUMMARY
Generated: ${new Date().toLocaleDateString()}

GDPR STATUS: COMPLIANT
- All employee health data processing compliant with GDPR Article 9
- Last audit: April 28, 2026

OSHA PREDICTION:
- Predicted Recordable Incidents (Next Quarter): ${oshaPrediction.predictedIncidents}
- Risk Level: ${oshaPrediction.riskLevel}
- High Risk Employees: ${oshaPrediction.highRiskCount}

WORKERS COMPENSATION:
- Total Estimated Cost (High Risk): $${workersCompEstimation.totalEstimated.toLocaleString()}
- Open Claims: ${workersCompEstimation.openClaims}

ADA ACCOMMODATIONS:
- Pending Requests: ${MOCK_ADA_ACCOMMODATIONS.filter(a => a.status === 'Pending').length}
- Implemented: ${MOCK_ADA_ACCOMMODATIONS.filter(a => a.status === 'Implemented').length}

EMPLOYEE COMPLIANCE STATUS:
- Compliant: ${compliant}
- At Risk: ${atRisk}
- Non-Compliant: ${nonCompliant}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowGenerateModal(false);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'osha', label: 'OSHA Tracking', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'workerscomp', label: 'Workers Comp', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'ada', label: 'ADA', icon: <Accessibility className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Compliance & Reports</h1>
              <p className="text-xs text-slate-500">GDPR, OSHA, Regulatory Reporting</p>
            </div>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generate Compliance Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* GDPR Status Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">GDPR Compliance Status</h2>
                    <p className="text-emerald-100 text-sm mt-1">
                      All employee health data processing is compliant with GDPR Article 9.
                      Last audit: April 28, 2026.
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-1 text-emerald-300" />
                  <p className="text-sm font-bold">COMPLIANT</p>
                </div>
              </div>
            </motion.div>

            {/* Compliance KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'GDPR Compliant', value: compliant, icon: CheckCircle2, color: 'emerald' },
                { label: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'amber' },
                { label: 'Non-Compliant', value: nonCompliant, icon: AlertTriangle, color: 'red' },
                { label: 'Reports Generated', value: reports.length, icon: FileText, color: 'indigo' }
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className={`p-2 rounded-xl bg-${kpi.color}-50 mb-3 inline-block`}>
                    <kpi.icon className={`w-4 h-4 text-${kpi.color}-500`} />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
                </motion.div>
              ))}
            </div>

            {/* OSHA Prediction */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                OSHA Recordable Risk Prediction
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-2xl font-black text-blue-700">{oshaPrediction.predictedIncidents}</p>
                  <p className="text-xs text-blue-600 mt-1">Predicted Recordables</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className={`text-2xl font-black ${oshaPrediction.riskLevel === 'High' ? 'text-red-700' : oshaPrediction.riskLevel === 'Moderate' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {oshaPrediction.riskLevel}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Risk Level</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-2xl font-black text-amber-700">{oshaPrediction.highRiskCount}</p>
                  <p className="text-xs text-amber-600 mt-1">High Risk Employees</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-2xl font-black text-slate-700">{oshaPrediction.totalIncidentsLastYear}</p>
                  <p className="text-xs text-slate-500 mt-1">Last Year Incidents</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Based on MSK risk scores, we predict approximately {oshaPrediction.predictedIncidents} OSHA-recordable incidents in the next quarter.
                High-risk employees should be prioritized for ergonomic interventions.
              </p>
            </div>

            {/* Workers Comp Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-violet-500" />
                Workers Compensation Cost Estimation
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-violet-50 rounded-xl p-4">
                  <p className="text-2xl font-black text-violet-700">{workersCompEstimation.highRiskCount}</p>
                  <p className="text-xs text-violet-600 mt-1">High Risk Employees</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-2xl font-black text-amber-700">${(workersCompEstimation.totalEstimated / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-amber-600 mt-1">Estimated Cost</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-2xl font-black text-emerald-700">${(workersCompEstimation.totalActual / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-emerald-600 mt-1">Actual Cost</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Top Estimated Claims</p>
                <div className="space-y-2">
                  {workersCompEstimation.estimatedCosts.slice(0, 3).map(cost => (
                    <div key={cost.employeeId} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{cost.name}</span>
                      <span className="text-sm font-bold text-amber-600">${cost.estimatedClaimCost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* OSHA Tab */}
        {activeTab === 'osha' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">OSHA Incident Tracking</h2>
              <button
                onClick={() => handleExportCSV('osha')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* OSHA Prediction Card */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">OSHA Recordable Risk Prediction</h3>
                  <p className="text-sm text-blue-700">AI-powered prediction for next quarter</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-3xl font-black text-blue-700">{oshaPrediction.predictedIncidents}</p>
                  <p className="text-xs text-blue-600">Predicted Incidents</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-lg font-bold text-blue-800">{oshaPrediction.highRiskCount}</p>
                  <p className="text-xs text-blue-600">High Risk MSK</p>
                </div>
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="text-lg font-bold text-blue-800">{oshaPrediction.moderateRiskCount}</p>
                  <p className="text-xs text-blue-600">Moderate Risk</p>
                </div>
                <div className="bg-white/60 rounded-xl p-4">
                  <p className={`text-lg font-bold ${oshaPrediction.riskLevel === 'High' ? 'text-red-700' : oshaPrediction.riskLevel === 'Moderate' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {oshaPrediction.riskLevel}
                  </p>
                  <p className="text-xs text-blue-600">Risk Level</p>
                </div>
              </div>
            </div>

            {/* OSHA Records Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Incident Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-bold text-slate-500 uppercase pb-3">Date</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase pb-3">Employee</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase pb-3">Type</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase pb-3">Body Part</th>
                      <th className="text-center text-xs font-bold text-slate-500 uppercase pb-3">Recordable</th>
                      <th className="text-center text-xs font-bold text-slate-500 uppercase pb-3">Days Away</th>
                      <th className="text-center text-xs font-bold text-slate-500 uppercase pb-3">Restricted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_OSHA_RECORDS.map(record => {
                      const employee = employees.find(e => e.id === record.employeeId);
                      return (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 text-sm text-slate-600">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-3 text-sm font-medium text-slate-900">{employee?.name || 'Unknown'}</td>
                          <td className="py-3 text-sm text-slate-600">{record.type}</td>
                          <td className="py-3 text-sm text-slate-600">{record.bodyPart}</td>
                          <td className="py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${record.oshaRecordable ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                              {record.oshaRecordable ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 text-center text-sm text-slate-600">{record.daysAway}</td>
                          <td className="py-3 text-center text-sm text-slate-600">{record.restrictedDays}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Workers Comp Tab */}
        {activeTab === 'workerscomp' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Workers Compensation</h2>
              <button
                onClick={() => handleExportCSV('workerscomp')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Cost Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-3xl font-black text-violet-700">{workersCompEstimation.highRiskCount}</p>
                <p className="text-xs text-slate-500 mt-1">High Risk Employees</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-3xl font-black text-amber-700">${(workersCompEstimation.totalEstimated / 1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-500 mt-1">Estimated Cost</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-3xl font-black text-emerald-700">${(workersCompEstimation.totalActual / 1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-500 mt-1">Actual Cost</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-3xl font-black text-amber-700">{workersCompEstimation.openClaims}</p>
                <p className="text-xs text-slate-500 mt-1">Open Claims</p>
              </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Active Claims</h3>
              <div className="space-y-3">
                {MOCK_WORKERS_COMP.map(claim => {
                  const employee = employees.find(e => e.id === claim.employeeId);
                  return (
                    <div key={claim.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${claim.status === 'Open' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                          <Briefcase className={`w-5 h-5 ${claim.status === 'Open' ? 'text-amber-600' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{employee?.name || 'Unknown'}</p>
                          <p className="text-sm text-slate-500">{claim.claimType} - {claim.bodyPart}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            ${(claim.actualCost || claim.estimatedCost).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400">{claim.actualCost ? 'Actual' : 'Estimated'}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ADA Tab */}
        {activeTab === 'ada' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">ADA Accommodations</h2>
              <button
                onClick={() => handleExportCSV('ada')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* ADA Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending', count: MOCK_ADA_ACCOMMODATIONS.filter(a => a.status === 'Pending').length, color: 'amber' },
                { label: 'Approved', count: MOCK_ADA_ACCOMMODATIONS.filter(a => a.status === 'Approved').length, color: 'indigo' },
                { label: 'Implemented', count: MOCK_ADA_ACCOMMODATIONS.filter(a => a.status === 'Implemented').length, color: 'emerald' },
                { label: 'Denied', count: MOCK_ADA_ACCOMMODATIONS.filter(a => a.status === 'Denied').length, color: 'red' }
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-3xl font-black text-slate-900">{stat.count}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Accommodations List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Accommodation Requests</h3>
              <div className="space-y-3">
                {MOCK_ADA_ACCOMMODATIONS.map(accommodation => {
                  const employee = employees.find(e => e.id === accommodation.employeeId);
                  return (
                    <div key={accommodation.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                          <Accessibility className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{employee?.name || 'Unknown'}</p>
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                              {accommodation.type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{accommodation.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Requested: {new Date(accommodation.requestDate).toLocaleDateString()}
                            {accommodation.resolvedDate && ` • Resolved: ${new Date(accommodation.resolvedDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeColor(accommodation.status)}`}>
                        {accommodation.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Available Reports</h2>
            <div className="space-y-3">
              {reports.map((report, i) => {
                const colors = getReportTypeColor(report.type);
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${colors.bg}`}>
                        <FileText className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{report.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.generated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>{report.pages} pages</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                      <div className="flex gap-1">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Generate Compliance Report</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Generate a comprehensive compliance report including:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    GDPR Compliance Status
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    OSHA Recordable Predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Workers Compensation Analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ADA Accommodation Status
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Employee Risk Summary
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePDF}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Generate PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
