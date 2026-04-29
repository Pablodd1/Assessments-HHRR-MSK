import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Target, 
  Flame, 
  Users2, 
  ShieldCheck, 
  BrainCircuit,
  MessageCircle,
  Gem,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export const ManagementAudit = () => {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<any>(null);

  const steps = [
    {
      title: "Strategic Alignment",
      subtitle: "Quantifying your vision's reach within the organization.",
      fields: [
        { label: "Do you feel your core values are being accurately practiced on the floor?", type: "range" },
        { label: "Rate the speed of decision-to-execution in your current chain of command.", type: "range" }
      ]
    },
    {
      title: "Conduct & Integrity",
      subtitle: "Monitoring trust silos and behavioral risks in leadership.",
      fields: [
        { label: "How often do you measure the 'Internal Trust' metric between departments?", type: "select", options: ["Weekly", "Monthly", "Yearly", "Never"] },
        { label: "Is there a mechanism to detect institutional cynicism before it hits turnover?", type: "toggle" }
      ]
    }
  ];

  const handleFinish = () => {
    setResults({
      alignment: 82,
      integrity: 74,
      viability: 91,
      recommendation: "Increase direct behavioral feedback loops between managers and ground staff to reduce cynicism."
    });
    setStep(3);
  };

  return (
    <div className="flex-1 bg-slate-900 p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">
            <Gem className="w-4 h-4" />
            Executive Behavioral Audit
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Management Conductivity <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Analysis</span></h1>
          <p className="text-slate-400 mt-2 text-lg">Probing the psychological resonance of leadership in high-scale industries.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-[2.5rem] p-10 border border-slate-700 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Target className="w-32 h-32 text-indigo-400" />
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Pillar 1: Strategic Resonance</h2>
                <p className="text-slate-400 mb-10">Measuring how well your professional vision is actually perceived by the workforce.</p>

                <div className="space-y-12">
                  <div className="space-y-6">
                    <label className="block text-sm font-bold text-slate-300">Degree of Value Alignment (Ground Staff)</label>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Decoupled</span>
                      <input type="range" className="flex-1 accent-indigo-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Unified</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-sm font-bold text-slate-300">Trust Velocity (Speed of Information)</label>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Lagging</span>
                      <input type="range" className="flex-1 accent-indigo-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Instant</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                  >
                    Analyze Leadership Integrity
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-[2.5rem] p-10 border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase">
                  <ChevronLeft className="w-4 h-4" />
                  Pillar 1
                </button>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-400/10 px-3 py-1 rounded-full">Section 2/2</div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Pillar 2: Conduct Control</h2>
              <p className="text-slate-400 mb-10">Quantifying deep-level behavioral cues and performance synchronization.</p>

              <div className="space-y-8">
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 space-y-4">
                   <label className="block text-sm font-bold text-slate-300">Are there observable 'Motivation Silos' in specific departments?</label>
                   <div className="flex gap-3">
                      <button className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-all">Yes, High Isolation</button>
                      <button className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-all">Moderate Integration</button>
                      <button className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-900/50">Total Synergy</button>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-300">Quantified Burnout Risk (Management Tier)</label>
                  <input type="range" className="w-full accent-indigo-500" />
                </div>
              </div>

              <div className="mt-12">
                <button 
                  onClick={handleFinish}
                  className="w-full py-5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm Strategic Assessment
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && results && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-12 text-slate-900 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative z-10 text-center space-y-8">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3">
                  <BrainCircuit className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Audit Complete</h2>
                  <p className="text-slate-500 font-medium">Strategic alignment and conductivity report generated.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alignment</p>
                    <p className="text-3xl font-black text-indigo-600">{results.alignment}%</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Integrity</p>
                    <p className="text-3xl font-black text-violet-600">{results.integrity}%</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Viability</p>
                    <p className="text-3xl font-black text-emerald-600">{results.viability}%</p>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-left">
                  <h5 className="flex items-center gap-2 text-xs font-black text-indigo-900 uppercase tracking-widest mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    Proprietary Recommendation
                  </h5>
                  <p className="text-sm font-bold text-indigo-800 leading-relaxed">
                    {results.recommendation}
                  </p>
                </div>

                <button 
                  onClick={() => setStep(1)}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                  Restart Assessment Protocol
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Study Insight */}
        <div className="mt-12 flex items-start gap-6 p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50">
          <div className="p-3 bg-slate-700 rounded-xl">
            <Users2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1 italic">Why Conduct Matters for Scaling</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              In high-turnover industries like hospitality, the "Human Drag" often accounts for up to 30% of lost revenue. Our algorithm maps subtle behavior cues—lateness patterns, voice sentiment, and motivation silos—to give you a predictive map of your company's future stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
