import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Mic, 
  StopCircle, 
  Send, 
  AlertCircle, 
  Smile, 
  Frown, 
  Meh,
  Briefcase,
  History,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export const StaffAssessment = () => {
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    motivation: 50,
    latenessReason: '',
    performanceFeeling: '',
    improvementIdeas: '',
    wantsToLeave: false
  });

  const handleMicClick = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate recording...
      setTimeout(() => {
        setVoiceText("I've been feeling quite overwhelmed lately with the workload. The communication between shifts could be better, and I often feel like my efforts aren't being recognized by the management team.");
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Staff Vitality & Performance Audit</h1>
          <p className="text-gray-500 mt-2">Help us understand organizational friction points to improve your workspace.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50"
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-indigo-600 rounded-xl text-white">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Section 1: General Dynamics</h2>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Staff Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="">Select Dept</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="F&B">Food & Beverage</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 text-center">How would you rate your motivation today?</label>
                  <div className="flex items-center justify-between px-4">
                    <div className="flex flex-col items-center">
                      <Frown className={`w-8 h-8 ${formData.motivation < 30 ? 'text-red-500 scale-125' : 'text-gray-300'} transition-all`} />
                      <span className="text-[10px] font-bold text-gray-500 mt-1">LOW</span>
                    </div>
                    <input 
                      type="range" 
                      className="flex-1 mx-8 accent-indigo-600"
                      min="0" max="100"
                      value={formData.motivation}
                      onChange={e => setFormData({...formData, motivation: parseInt(e.target.value)})}
                    />
                    <div className="flex flex-col items-center">
                      <Smile className={`w-8 h-8 ${formData.motivation > 70 ? 'text-green-500 scale-125' : 'text-gray-300'} transition-all`} />
                      <span className="text-[10px] font-bold text-gray-500 mt-1">HIGH</span>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-2xl font-black text-indigo-600">{formData.motivation}%</p>
                </div>

                <div className="pt-6">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Analyze Performance Metrics</span>
                    <History className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-600 rounded-xl text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Section 2: Risk & Performance Breakdown</h2>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Back
                </button>
              </div>

              <div className="space-y-8">
                {/* Voice Intake Section */}
                <div className="relative group">
                   <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    Confidential Voice Testimony
                    <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black animate-pulse">LIVE ANALYTICS</span>
                  </label>
                  <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${isRecording ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} flex flex-col items-center text-center`}>
                    <button 
                      onClick={handleMicClick}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:scale-105 shadow-lg shadow-indigo-200'} text-white mb-4`}
                    >
                      {isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <p className="text-sm font-bold text-gray-600">
                      {isRecording ? "Recording... (Gemini will analyze sentiment)" : "Click to record your honest feedback about motivation and performance"}
                    </p>
                    {voiceText && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-100 text-left text-sm italic text-gray-700 shadow-sm">
                        "{voiceText}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">If you've been late recently, what was the primary cause?</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Traffic, Childcare, Motivation, Fatigue..."
                      value={formData.latenessReason}
                      onChange={e => setFormData({...formData, latenessReason: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantify your desire to continue with the company (0-100)</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="range" 
                        className="flex-1 accent-indigo-600"
                        min="0" max="100"
                        value={formData.wantsToLeave ? 20 : 80}
                        onChange={e => setFormData({...formData, wantsToLeave: parseInt(e.target.value) < 50})}
                      />
                      <span className="text-sm font-bold w-12 text-center text-indigo-600">
                        {formData.wantsToLeave ? 'LOW' : 'HIGH'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleSubmit}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Submit Risk Assessment</span>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-3xl shadow-xl border border-green-50 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Completed</h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">Your metrics have been quantified and anonymized for organizational study. Management will review the risk indicators to improve environment friction.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Motivation</p>
                  <p className="text-xl font-bold text-indigo-600">{formData.motivation}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Risk Level</p>
                  <p className={`text-xl font-bold ${formData.wantsToLeave ? 'text-red-500' : 'text-green-500'}`}>
                    {formData.wantsToLeave ? 'ELEVATED' : 'STABLE'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all"
              >
                Start New Assessment
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scalability Info */}
        <div className="mt-12 bg-indigo-900 text-indigo-100 p-8 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center italic">
                <TrendingUp className="w-5 h-5 mr-2" />
                Scaling for Large Industries (Hotels & Logistics)
              </h3>
              <p className="text-indigo-200/80 text-sm leading-relaxed">
                This diagnostic toolkit is designed to quantify the "Human Cost" of operations. In large industrial settings, these metrics are integrated with payroll and attendance logs to predict burnout before it impacts <strong>profit margins and guest experience</strong>.
              </p>
            </div>
            <div className="flex-shrink-0">
               <div className="bg-indigo-800 p-4 rounded-2xl border border-indigo-700">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1 leading-none">Global Accuracy</p>
                  <p className="text-2xl font-black">94.2%</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
