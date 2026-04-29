import React from 'react';
import { useDemo } from '../store/DemoContext';
import { 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight,
  Zap,
  Heart,
  BarChart3,
  Dna,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export const CompanyAudit = () => {
  const { patients, employeeRisks } = useDemo();

  // Aggregate Data for the "Doctor" (Clinic)
  const healthInterests = patients.reduce((acc: any, p) => {
    const interest = p.interest || 'General Wellness';
    acc[interest] = (acc[interest] || 0) + 1;
    return acc;
  }, {});

  const topInterest = Object.entries(healthInterests).sort((a: any, b: any) => b[1] - a[1])[0] || ['Recovery', 0];

  // Aggregate Data for the "HR Expert" (Behavioral)
  const stats = {
    avgMotivation: Math.round(employeeRisks.reduce((acc, curr) => acc + curr.motivationLevel, 0) / employeeRisks.length),
    criticalEmployees: employeeRisks.filter(e => e.turnoverRisk === 'High').length,
    avgPerformance: Math.round(employeeRisks.reduce((acc, curr) => acc + curr.performanceScore, 0) / employeeRisks.length),
  };

  return (
    <div className="flex-1 bg-[#f8fafc] p-6 lg:p-10 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
              <Building2 className="w-4 h-4" />
              Enterprise Strategy
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Holistic Health & Risk Audit</h1>
            <p className="text-slate-500 mt-2 text-lg">Cross-referencing clinical wellness data with workforce behavioral metrics.</p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold text-slate-700">Live Data Sync</span>
            </div>
          </div>
        </div>

        {/* The Two Pillars: Clinical vs Behavioral */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Clinical Health Pillar (The Doctor's View) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Stethoscope className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Dna className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Clinical Health Signals</h3>
                <p className="text-sm text-slate-500 font-medium">Aggregated Medical Interests</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase">Primary Health Goal</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{topInterest[0]}</p>
                <div className="mt-2 flex items-center text-xs font-bold text-indigo-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Dominates 42% of leads
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase">Wellness Engagement</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{patients.length} Active</p>
                <div className="mt-2 flex items-center text-xs font-bold text-green-600">
                  <Heart className="w-3 h-3 mr-1" />
                  Positive health intent
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top Wellness Tracks</h4>
              {Object.entries(healthInterests).slice(0, 3).map(([key, val]: any) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{key}</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(val / patients.length) * 100}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-900">{val} leads</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Behavioral Risk Pillar (The HR Professional's View) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-slate-900/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32 text-indigo-400" />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white rounded-2xl text-slate-900 shadow-lg shadow-white/10">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Workforce Behavioral Risk</h3>
                <p className="text-sm text-slate-400 font-medium">Quantified Human Conduct</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Retention Stability</p>
                <p className="text-2xl font-black text-white mt-1">{stats.avgMotivation}%</p>
                <div className="mt-2 flex items-center text-xs font-bold text-yellow-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Motivation index
                </div>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Burnout Criticality</p>
                <p className="text-2xl font-black text-red-500 mt-1">{stats.criticalEmployees} High Risk</p>
                <div className="mt-2 flex items-center text-xs font-bold text-red-400">
                  <Zap className="w-3 h-3 mr-1" />
                  Requires Intervention
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Top Risk Indicators</h4>
              {[
                { label: 'Chronic Lateness', val: 68, color: 'bg-red-500' },
                { label: 'Motivational Attrition', val: 42, color: 'bg-yellow-500' },
                { label: 'Performance Drag', val: 24, color: 'bg-blue-500' }
              ].map((risk) => (
                <div key={risk.label} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">{risk.label}</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${risk.val}%` }}
                      className={`h-full ${risk.color}`}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-400">{risk.val}% Impact</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Professional Joint Assessment */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 lg:p-14 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            
            <div className="md:col-span-2 space-y-6">
              <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-widest uppercase mb-4">
                <BarChart3 className="w-3 h-3 mr-2" />
                Collaborative Intelligence
              </div>
              <h2 className="text-3xl md:text-5xl font-black leading-tight">Quantify the Human Cost <br /> on Operational Profit</h2>
              <p className="text-indigo-100 text-lg leading-relaxed max-w-xl">
                By bridging clinical data with behavioral logs, we move beyond simple metrics. We identify exactly why people are falling sick, lacking performance, and coming late. This is the ultimate tool for <strong>Enterprise Risk Assessment</strong>.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-slate-50 transition-all shadow-xl">
                  Generate Integrated Report
                </button>
                <button className="px-8 py-4 bg-indigo-500/30 text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-indigo-500/50 transition-all">
                  Consultation Protocol
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 space-y-6">
              <div className="flex justify-between items-center">
                <h5 className="font-bold uppercase tracking-widest text-xs opacity-70">Company Health Score</h5>
                <span className="text-2xl font-black">74/100</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Clinical Readiness', color: 'bg-green-400' },
                  { label: 'Workforce Sincerity', color: 'bg-blue-400' },
                  { label: 'Burnout Buffer', color: 'bg-yellow-400' }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                      <span>{item.label}</span>
                      <span>{Math.floor(Math.random() * 20) + 70}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} w-3/4`}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[10px] font-bold opacity-50">TRUSTED BY 20+ GLOBAL HOTELS</p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};
