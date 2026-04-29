import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2000"
            alt="Biohacking and Wellness"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6 uppercase tracking-widest">
              Biohacking & Optimization
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Optimize Your Potential
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              A clinician-led approach designed to support your lifestyle goals through individualized wellness strategies.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">Supports Wellness</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our programs are designed to provide educational information and strategies that support your overall vitality.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">Individualized Approach</h3>
                <p className="mt-2 text-base text-gray-500">
                  We recognize that every body is different. Receive guidance tailored to your specific lifestyle goals.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">Clinician-Led Consultation</h3>
                <p className="mt-2 text-base text-gray-500">
                  Discuss your options with professionals dedicated to helping you understand your body better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps & CTA */}
      <div className="py-16 bg-white text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
          <p className="text-gray-500 mb-8">
            Answer a few quick questions about your goals. We'll prepare a personalized educational sequence and invite you to schedule a consultation.
          </p>
          
          <button
            onClick={() => navigate('/form')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-1"
          >
            Get Your 60-Second Wellness Plan
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-auto bg-gray-100 py-6 px-4 text-center">
        <p className="text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed">
          This content is educational only and does not provide medical advice. Individual experiences vary. 
          Not intended to diagnose, treat, cure, or prevent any disease. Results are not guaranteed.
        </p>
      </div>
    </div>
  );
};
