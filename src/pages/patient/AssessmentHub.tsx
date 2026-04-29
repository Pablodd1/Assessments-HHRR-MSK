import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ActivitySquare,
  ScanLine,
  Camera,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Clock,
  Zap,
  HeartPulse,
  ArrowRight,
  User
} from 'lucide-react';
import { useDemo } from '../../store/DemoContext';

const assessmentTypes = [
  {
    id: 'msk',
    name: 'MSK Risk Screen',
    description: 'Musculoskeletal self-assessment for pain, stiffness, and mobility across 8 body regions',
    icon: ActivitySquare,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    hoverBg: 'hover:bg-indigo-50',
    iconBg: 'bg-indigo-600',
    route: '/msk-screen',
    estimatedTime: '5 min',
    tag: 'Most Common',
    tagBg: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: '3d',
    name: '3D Motion Assessment',
    description: 'AI-powered movement analysis using your camera — squat, reach, and gait tests',
    icon: ScanLine,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    hoverBg: 'hover:bg-emerald-50',
    iconBg: 'bg-emerald-600',
    route: '/3d-assessment',
    estimatedTime: '10 min',
    tag: 'Advanced',
    tagBg: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'posture',
    name: 'Posture Analysis',
    description: 'Photo-based posture evaluation with body alignment scoring and corrective exercises',
    icon: Camera,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    hoverBorder: 'hover:border-violet-400',
    hoverBg: 'hover:bg-violet-50',
    iconBg: 'bg-violet-600',
    route: '/posture-analysis',
    estimatedTime: '3 min',
    tag: 'Quick',
    tagBg: 'bg-violet-100 text-violet-700'
  }
];

export const AssessmentHub = () => {
  const { currentUser, employees } = useDemo();
  const navigate = useNavigate();

  // Get current patient name for personalization
  const currentEmployee = employees.find(e => e.id === currentUser?.employeeId);
  const patientName = currentEmployee?.name || currentUser?.name || 'Patient';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">{patientName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-bold mb-4">
            <HeartPulse className="w-4 h-4 mr-2" />
            Health & Risk Assessment
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Choose Your Assessment
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            Select the assessment type that best fits your needs. Each assessment builds your complete health profile and helps our team provide personalized care.
          </p>
        </motion.div>

        {/* Assessment Cards */}
        <div className="space-y-4">
          {assessmentTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
              >
                <Link
                  to={type.route}
                  className={`block p-6 rounded-2xl border-2 ${type.bg} ${type.border} ${type.hoverBorder} ${type.hoverBg} transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Icon + Text */}
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${type.gradient} shadow-lg shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-xl font-bold text-slate-900">{type.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${type.tagBg}`}>
                            {type.tag}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{type.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {type.estimatedTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">GDPR Protected</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: CTA */}
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <span className={`hidden sm:block px-4 py-2.5 bg-gradient-to-r ${type.gradient} text-white rounded-xl font-bold text-sm shadow-lg group-hover:shadow-xl transition-all`}>
                        Start
                        <ArrowRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Mobile CTA - shows below content */}
                  <div className="sm:hidden mt-4">
                    <span className={`block w-full px-4 py-2.5 bg-gradient-to-r ${type.gradient} text-white rounded-xl font-bold text-sm text-center`}>
                      Start Assessment
                      <ArrowRight className="w-4 h-4 inline ml-2" />
                    </span>
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
          transition={{ delay: 0.7 }}
          className="mt-10 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl shrink-0">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Why Complete an Assessment?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your assessment results are combined with your HR health data to provide a complete picture of your wellbeing.
                Results help identify personalized wellness programs and early intervention opportunities — all while maintaining your privacy under GDPR Article 9.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Your data is encrypted and never shared without your explicit consent
        </motion.div>
      </div>
    </div>
  );
};
