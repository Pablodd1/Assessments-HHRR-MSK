import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scan,
  ActivitySquare,
  ScanLine,
  Camera,
  FileText,
  ChevronRight,
  ShieldCheck,
  Clock,
  Zap,
  HeartPulse,
  ArrowRight
} from 'lucide-react';

const assessmentTypes = [
  {
    id: 'msk',
    name: 'MSK Risk Screen',
    description: 'Musculoskeletal self-assessment for pain, stiffness, and mobility',
    icon: ActivitySquare,
    color: 'indigo',
    route: '/msk-screen',
    estimatedTime: '5 min',
    tag: 'Most Common'
  },
  {
    id: '3d',
    name: '3D Motion Assessment',
    description: 'AI-powered movement analysis using your camera',
    icon: ScanLine,
    color: 'emerald',
    route: '/3d-assessment',
    estimatedTime: '10 min',
    tag: 'Advanced'
  },
  {
    id: 'posture',
    name: 'Posture Analysis',
    description: 'Photo-based posture evaluation with body alignment check',
    icon: Camera,
    color: 'violet',
    route: '/posture-analysis',
    estimatedTime: '3 min',
    tag: 'Quick'
  }
];

const colorMap: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', gradient: 'from-violet-500 to-violet-600' }
};

export const AssessmentHub = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-bold mb-4">
            <HeartPulse className="w-4 h-4 mr-2" />
            Health & Risk Assessment
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Choose Your Assessment
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Select the assessment type that best fits your needs. Each assessment helps build your complete health profile.
          </p>
        </motion.div>

        {/* Assessment Cards */}
        <div className="space-y-4">
          {assessmentTypes.map((type, index) => {
            const colors = colorMap[type.color];
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={type.route}
                  className={`block p-6 rounded-2xl border-2 ${colors.border} ${colors.bg} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-slate-900">{type.name}</h3>
                          <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-black text-slate-600 uppercase tracking-wider">
                            {type.tag}
                          </span>
                        </div>
                        <p className="text-slate-600">{type.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {type.estimatedTime}
                          </span>
                          <span className="flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            GDPR Compliant
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className={`px-5 py-2.5 bg-gradient-to-r ${colors.gradient} text-white rounded-xl font-bold text-sm shadow-lg group-hover:shadow-xl transition-all flex items-center`}>
                        Start
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Why Complete an Assessment?</h4>
              <p className="text-sm text-slate-600">
                Your assessment results are combined with HR health data to provide a complete picture of your wellbeing.
                Results help identify personalized wellness programs and early intervention opportunities — all while maintaining your privacy.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
