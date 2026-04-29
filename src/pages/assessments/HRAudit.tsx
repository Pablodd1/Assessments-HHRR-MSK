import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Scale, 
  Users, 
  AlertTriangle, 
  FileCheck, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  UserCheck
} from 'lucide-react';

export const HRAudit = () => {
  const [step, setStep] = useState(1);
  const [activeAnalysis, setActiveAnalysis] = useState(false);

  return (
    <div className="flex-1 bg-white p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <ShieldAlert className="w-4 h-4" />
              Institutional Safety Audit
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Workforce Liability & <br /><span className="text-rose-600">Culture Pulse</span></h1>
            <p className="text-gray-500 mt-2 text-lg">Detecting institutional risk, toxicity, and compliance gaps through behavioral diagnostics.</p>
          </div>
          <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                 HR
               </div>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Assessment Form Area */}
          <div className="lg:col-span-2 space-y-8">
            
            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-600 rounded-xl text-white">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">1. Regulatory & Ethics Pulse</h3>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">Are there perceived power imbalances in the current departmental hierarchy?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white hover:border-rose-500 transition-all">Yes, High Friction</button>
                    <button className="py-3 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-lg">Stable Symmetry</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Quantify 'Quiet Quitting' markers observed in weekly reports (0-100)</label>
                  <input type="range" className="w-full accent-rose-600" />
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                    <span>Low Signal</span>
                    <span>Systemic Risk</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <UserCheck className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">2. Social Cohesion Dynamics</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Describe any observed motivational lag in the 'Front Desk' or 'Clinical Operations' recently.</p>
                <textarea 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all min-h-[120px] text-sm"
                  placeholder="Focus on behavioral conduct and peer-to-peer sentiment..."
                ></textarea>
              </div>

              <div className="mt-8">
                 <button 
                  onClick={() => {
                    setActiveAnalysis(true);
                    setTimeout(() => setActiveAnalysis(false), 3000);
                  }}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3"
                 >
                   {activeAnalysis ? (
                     <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Analyzing Sentiment Data...
                     </>
                   ) : (
                     <>
                      Deep Pulse Analysis
                      <ArrowRight className="w-5 h-5" />
                     </>
                   )}
                 </button>
              </div>
            </section>
          </div>

          {/* Side Context / Info */}
          <div className="space-y-6">
             <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Expert Insight</h4>
                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-rose-500 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed">
                        <strong>Late Patterns:</strong> In 84% of hospitality cases, chronic lateness is the first marker of psychological disengagement.
                      </p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-indigo-500 rounded-full">
                        <TrendingDown className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed">
                        <strong>Motivation Decay:</strong> Detecting decay early reduces hiring costs by $12k per employee per year.
                      </p>
                   </div>
                </div>
             </div>

             <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                   <Activity className="w-4 h-4 text-indigo-600" />
                   <span className="text-[10px] font-black text-indigo-900 uppercase">Live Risk Index</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold text-indigo-700">
                      <span>Cultural Friction</span>
                      <span>42%</span>
                   </div>
                   <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-[42%]"></div>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <FileCheck className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-tighter">Compliance State</span>
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Last legal review: <strong>48 hours ago</strong>. All behavioral audits are anonymized to protect company liability.
                </p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};
