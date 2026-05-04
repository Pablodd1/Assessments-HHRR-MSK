import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Eye,
  FileText,
  Server,
  Key,
  Clock,
  Activity,
  ExternalLink
} from 'lucide-react';
import {
  TECHNICAL_SAFEGUARDS,
  getPlatformComplianceStatus,
  assessCompliance,
  type ComplianceAssessmentItem,
  type ComplianceReport
} from '../../lib/rag/hipaaCompliance';

export const HIPAADashboard = () => {
  const navigate = useNavigate();
  const [statusItems] = useState<ComplianceAssessmentItem[]>(getPlatformComplianceStatus());
  const [report] = useState<ComplianceReport>(assessCompliance(statusItems));

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'compliant': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'partial': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'non_compliant': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'compliant': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partial': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getSectionIcon = (id: string) => {
    if (id.startsWith('ac')) return <Lock className="w-4 h-4" />;
    if (id.startsWith('audit')) return <Eye className="w-4 h-4" />;
    if (id.startsWith('integrity')) return <FileText className="w-4 h-4" />;
    if (id === 'authentication') return <Key className="w-4 h-4" />;
    if (id.startsWith('transmission')) return <Server className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/reports')} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                HIPAA Technical Safeguards
              </h1>
              <p className="text-gray-500 mt-1">45 CFR 164.312 — Compliance Assessment Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Assessment Date: {report.assessmentDate}</span>
          </div>
        </div>

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 text-white shadow-lg ${
              report.overallStatus === 'compliant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
              report.overallStatus === 'substantial_gaps' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
              'bg-gradient-to-br from-red-500 to-rose-600'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Compliance Score</p>
            <p className="text-4xl font-black mt-2">{report.overallScore}%</p>
            <p className="text-xs mt-1 text-white/80 capitalize">{report.overallStatus.replace(/_/g, ' ')}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Safeguards</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{report.requiredSafeguards.compliant}</span>
              <span className="text-sm text-gray-400">/ {report.requiredSafeguards.total} compliant</span>
            </div>
            {report.requiredSafeguards.nonCompliant > 0 && (
              <p className="text-xs text-red-600 mt-1 font-bold">{report.requiredSafeguards.nonCompliant} non-compliant</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Addressable Safeguards</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">{report.addressableSafeguards.compliant}</span>
              <span className="text-sm text-gray-400">/ {report.addressableSafeguards.total} compliant</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Critical Findings</p>
            <span className="text-2xl font-black text-red-600">{report.criticalFindings.length}</span>
            <p className="text-xs text-gray-400 mt-1">Require immediate action</p>
          </motion.div>
        </div>

        {/* Priority Remediation */}
        {report.prioritizedRemediation.length > 0 && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Priority Remediation Actions
            </h3>
            <div className="space-y-2">
              {report.prioritizedRemediation.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <p className="text-sm text-gray-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safeguard Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Technical Safeguard Assessment Detail
            </h3>
            <div className="flex gap-2 text-[10px]">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">Compliant</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">Partial</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">Non-Compliant</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {statusItems.map((item) => {
              const safeguard = TECHNICAL_SAFEGUARDS.find(s => s.id === item.safeguardId);
              if (!safeguard) return null;
              return (
                <motion.div
                  key={item.safeguardId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getStateIcon(item.state)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getSectionIcon(item.safeguardId)}
                          <h4 className="font-bold text-gray-900 text-sm">{safeguard.title}</h4>
                          <span className="text-[10px] font-mono text-gray-400">{safeguard.section}</span>
                        </div>
                        <p className="text-xs text-gray-600">{safeguard.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${getRiskBadge(item.riskLevel)}`}>
                        {item.riskLevel}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStateBadge(item.state)}`}>
                        {item.state.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        safeguard.status === 'required' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {safeguard.status}
                      </span>
                    </div>
                  </div>

                  {/* Controls & Gaps */}
                  <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.implementedControls.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Implemented</p>
                        <ul className="space-y-0.5">
                          {item.implementedControls.map((c, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.gaps.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-700 uppercase mb-1">Gaps</p>
                        <ul className="space-y-0.5">
                          {item.gaps.map((g, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {item.remediationPlan && (
                    <div className="ml-8 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Remediation Plan</p>
                      <p className="text-xs text-blue-800">{item.remediationPlan}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="bg-gray-100 rounded-2xl p-5 border border-gray-200">
          <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Source & Regulatory References
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-xs text-gray-600">
              <p className="font-bold mb-1">Regulation</p>
              <p>{report.provenance.regulation}</p>
            </div>
            <div className="text-xs text-gray-600">
              <p className="font-bold mb-1">Guidance</p>
              <ul className="space-y-0.5">
                {report.provenance.guidance.map((g, i) => (
                  <li key={i}>• {g}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-gray-600">
              <p className="font-bold mb-1">Method</p>
              <p>{report.provenance.assessmentMethod}</p>
              <p className="mt-2 text-[10px] italic text-gray-500">
                Note: HIPAA is technology-neutral. Covered entities choose reasonable and appropriate measures based on risk analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
