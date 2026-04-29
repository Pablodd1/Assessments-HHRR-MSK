import React from 'react';
import { useDemo, UserRole } from '../store/DemoContext';
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  Briefcase, 
  Settings, 
  ArrowRight,
  Fingerprint,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const RoleLogin = () => {
  const { loginAs } = useDemo();

  const roles: { role: UserRole; icon: any; color: string; desc: string }[] = [
    { role: 'Patient', icon: Fingerprint, color: 'text-indigo-600 bg-indigo-50', desc: 'Book consultations and manage wellness journey.' },
    { role: 'Staff', icon: Stethoscope, color: 'text-blue-600 bg-blue-50', desc: 'Process patient leads and clinical intake.' },
    { role: 'HR', icon: Users, color: 'text-purple-600 bg-purple-50', desc: 'Monitor workforce burnout and risk assessment.' },
    { role: 'Management', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50', desc: 'Strategic organizational oversight and scaling.' },
    { role: 'Admin', icon: Settings, color: 'text-slate-600 bg-slate-50', desc: 'System configuration and user management.' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Gateway</h1>
          <p className="text-slate-500 mt-2">Select your organizational identity to enter the demo environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((item, idx) => (
            <motion.button
              key={item.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => loginAs(item.role)}
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left relative overflow-hidden"
            >
              <div className={`p-3 rounded-2xl ${item.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.role}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                {item.desc}
              </p>
              <div className="flex items-center text-sm font-bold text-indigo-600">
                Continue as {item.role}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                <item.icon className="w-24 h-24" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white inline-block px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            Demo Mode Enabled • Session Data is Episodic
          </p>
        </div>
      </div>
    </div>
  );
};
