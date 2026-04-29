import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  Calendar,
  Lock,
  Eye
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

const REPORTS = [
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
    type: 'Safety',
    status: 'Compliant',
    pages: 32
  }
];

export const ComplianceReports = () => {
  const { employees } = useDemo();
  const compliant = employees.filter(e => e.riskProfile.complianceStatus === 'Compliant').length;
  const atRisk = employees.filter(e => e.riskProfile.complianceStatus === 'AtRisk').length;
  const nonCompliant = employees.filter(e => e.riskProfile.complianceStatus === 'NonCompliant').length;

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
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            <FileText className="w-4 h-4" />
            Generate New Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
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
            { label: 'Reports Generated', value: REPORTS.length, icon: FileText, color: 'indigo' }
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

        {/* Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Available Reports</h2>
          <div className="space-y-3">
            {REPORTS.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    report.type === 'Compliance' ? 'bg-emerald-50' :
                    report.type === 'Risk' ? 'bg-red-50' :
                    report.type === 'Wellness' ? 'bg-indigo-50' : 'bg-amber-50'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      report.type === 'Compliance' ? 'text-emerald-600' :
                      report.type === 'Risk' ? 'text-red-600' :
                      report.type === 'Wellness' ? 'text-indigo-600' : 'text-amber-600'
                    }`} />
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
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    report.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700' :
                    report.status === 'Reviewed' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
