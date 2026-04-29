import React, { useState } from 'react';
import { useDemo, UserRole } from '../store/DemoContext';
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter, 
  Settings, 
  Database,
  Lock,
  Globe,
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminPanel = () => {
  const { patients, employeeRisks } = useDemo();
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'logs'>('users');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock list of "System Users" since they aren't all in the demo context
  const [systemUsers, setSystemUsers] = useState([
    { id: 'u1', name: 'James Carter', role: 'Admin', email: 'admin@clinic.demo', status: 'Active' },
    { id: 'u2', name: 'Elena Rodriguez', role: 'HR', email: 'elena@hr.demo', status: 'Active' },
    { id: 'u3', name: 'Marcus Chen', role: 'Management', email: 'marcus@hq.demo', status: 'Active' },
    { id: 'u4', name: 'Sarah Miller', role: 'Staff', email: 'sarah@floor.demo', status: 'Active' },
  ]);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
              <Shield className="w-3 h-3" />
              System Root Authorization 
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Administration</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Provision User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto flex gap-8 mt-8">
          {[
            { id: 'users', label: 'Identity Management', icon: UserPlus },
            { id: 'system', label: 'Infrastructure', icon: Database },
            { id: 'logs', label: 'Audit Logs', icon: Globe }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <AnimatePresence mode="wait">
            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Search / Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search system identities..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        All Roles
                      </button>
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                        Active Status
                      </button>
                   </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Privilege Level</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {systemUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold mr-3">
                                  {user.name[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                  <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                                user.role === 'Admin' ? 'bg-slate-900 text-white' :
                                user.role === 'Management' ? 'bg-indigo-100 text-indigo-700' :
                                user.role === 'HR' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                {user.status}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div 
                key="system"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <span className="text-[10px] font-black text-green-600 uppercase">Online</span>
                  </div>
                  <h4 className="font-bold text-slate-900">Patient Database</h4>
                  <p className="text-xs text-slate-500">Managing {patients.length} records. HIPAA-compliant encryption active.</p>
                  <button className="w-full py-2 bg-slate-50 text-[10px] font-black uppercase text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">Verify Integrity</button>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <Lock className="w-6 h-6 text-indigo-600" />
                    <span className="text-[10px] font-black text-green-600 uppercase">Secure</span>
                  </div>
                  <h4 className="font-bold text-slate-900">Auth & Privileges</h4>
                  <p className="text-xs text-slate-500">Active RBAC system covering 5 organizational tiers.</p>
                  <button className="w-full py-2 bg-slate-50 text-[10px] font-black uppercase text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">Rotary Policy Check</button>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 text-white">
                   <div className="p-2 bg-indigo-600 w-fit rounded-lg">
                      <Plus className="w-4 h-4" />
                   </div>
                   <h4 className="font-bold">Scale Infrastructure</h4>
                   <p className="text-xs text-slate-400 whitespace-pre-wrap">Configure shard multi-tenancy for international clinic logistics.</p>
                   <button className="w-full py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 text-[10px] font-black uppercase rounded-lg">Configure Shards</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Provision User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-110 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Provision Identity
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Display Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Dr. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Access Role</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Staff</option>
                    <option>HR</option>
                    <option>Management</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Enterprise Email</label>
                  <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="name@clinic.demo" />
                </div>
                <div className="pt-4">
                   <button 
                    onClick={() => setShowAddModal(false)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all"
                   >
                     Authorize Provisioning
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
