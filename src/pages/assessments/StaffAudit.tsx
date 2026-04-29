import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Battery, 
  Wind, 
  Flame, 
  Heart, 
  CheckCircle2, 
  ArrowRight,
  Stethoscope,
  Activity,
  Smile
} from 'lucide-react';

export const StaffAudit = () => {
  const [complete, setComplete] = useState(false);

  return (
    <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="max-w-3xl w-full">
        <AnimatePresence mode='wait'>
          {!complete ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[3rem] shadow-2xl p-8 lg:p-16 border border-slate-200"
            >
              <div className="flex flex-col items-center text-center mb-12">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                  <Brain className="w-10 h-10 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Psychological Well-being Audit</h1>
                <p className="text-slate-500 mt-2">Personalize your conduct profile and measure institutional burnout.</p>
              </div>

              <div className="space-y-10">
                {/* Burnout Scale */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Battery className="w-4 h-4 text-orange-500" />
                       Energy Depletion
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">Monthly Average</span>
                  </div>
                  <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>Recharged</span>
                    <span>Exhausted</span>
                  </div>
                </div>

                {/* Behavioral Conduct */}
                <div className="space-y-4">
                   <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Smile className="w-4 h-4 text-indigo-500" />
                       Social Conductivity
                    </label>
                    <p className="text-xs text-slate-500 font-medium">How often do you feel supported by your immediate supervisor in resolving conflicts?</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {['Never', 'Rarely', 'Usually', 'Always'].map(option => (
                         <button key={option} className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                           {option}
                         </button>
                       ))}
                    </div>
                </div>

                {/* Cognitive Load */}
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-500" />
                       Cognitive Resilience
                    </label>
                    <p className="text-xs text-slate-500 font-medium">Are the clinical tools and CRM platforms causing frustration or helping efficiency?</p>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] text-sm"
                      placeholder="Share your thoughts on workflow conductivity..."
                    ></textarea>
                </div>
              </div>

              <div className="mt-12">
                 <button 
                  onClick={() => setComplete(true)}
                  className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                 >
                   Submit Behavioral Audit
                   <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[4rem] shadow-2xl p-16 text-center space-y-8 border border-emerald-100"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Audit Synchronized</h2>
                <p className="text-slate-500 mt-2 text-lg">Your psychological health data has been securely integrated into the enterprise risk map.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 max-w-sm mx-auto">
                 <p className="text-xs font-bold text-emerald-800 italic leading-relaxed">
                   "Your resilience score is high. Consider taking a restorative 15-minute sensory break today to maintain peak conductivity."
                 </p>
              </div>
              <button 
                onClick={() => setComplete(false)}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                Return to Clinical View
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center text-slate-400 font-medium max-w-lg mx-auto">
           <p className="text-xs italic leading-relaxed">
             This audit is based on the <strong>Job Demands-Resources (JD-R) model</strong>, a psychological framework for predicting institutional burnout and performance.
           </p>
        </div>
      </div>
    </div>
  );
};
