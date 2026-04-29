import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, FileText, BrainCircuit, Mail, MessageSquare, LayoutDashboard, Calendar, ArrowRight, Users, ShieldAlert, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export const WorkflowMap = () => {
  const navigate = useNavigate();

  const nodes = [
    { id: 'qr', icon: QrCode, label: 'QR Scan', desc: 'Patient scans code at front desk or event.', route: '/qr' },
    { id: 'landing', icon: FileText, label: 'Landing Page', desc: 'Patient reads compliant specialty page.', route: '/landing' },
    { id: 'form', icon: FileText, label: 'Interest Form', desc: 'Patient submits goals and contact info.', route: '/form' },
    { id: 'ai', icon: BrainCircuit, label: 'AI Analysis', desc: 'System segments patient and scores intent.', route: '/analysis' },
    { id: 'comms', icon: Mail, label: 'Email Sequence', desc: 'Automated 5-part educational sequence.', route: '/communications' },
    { id: 'sms', icon: MessageSquare, label: 'SMS Trigger', desc: 'Automated text message reminders.', route: '/communications' },
    { id: 'schedule', icon: Calendar, label: 'Scheduling', desc: 'Patient books clinician consultation.', route: '/scheduling' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Clinic Dashboard', desc: 'Staff reviews lead and timeline.', route: '/dashboard' },
    { id: 'hr', icon: Users, label: 'HR Analysis', desc: 'Real-time organizational risk quantification.', route: '/hr' },
    { id: 'staff', icon: ShieldAlert, label: 'Staff Audit', desc: 'Voice-to-text behavioral performance pulse.', route: '/assessment' },
    { id: 'audit', icon: BarChart3, label: 'Enterprise Audit', desc: 'Holistic clinical vs behavioral company analysis.', route: '/audit' }
  ];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-12">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Patient Journey Workflow</h2>
          <p className="mt-2 text-gray-500">
            Interactive map of the automated acquisition and education process. Click any node to view that step.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[45px] left-[50px] right-[50px] h-1 bg-indigo-100 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(node.route)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{node.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{node.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
