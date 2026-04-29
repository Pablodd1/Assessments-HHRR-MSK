import React, { useState } from 'react';
import { useDemo } from '../store/DemoContext';
import { Patient } from '../data/mockData';
import { Users, UserPlus, Activity, Calendar, Search, Filter, ChevronRight, Mail, MessageSquare, BrainCircuit, Clock, CheckCircle2, Circle, ListTodo, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard = () => {
  const { patients, updatePatient, tasks, updateTask } = useDemo();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [pendingSortBy, setPendingSortBy] = useState<'dueDate' | 'patientName'>('dueDate');
  const [completedSortBy, setCompletedSortBy] = useState<'dueDate' | 'patientName'>('dueDate');

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLeads = patients.length;
  const newLeads = patients.filter(p => p.status === 'New' || p.status === 'Analyzed').length;
  const contactedLeads = patients.filter(p => p.status === 'Contacted').length;
  const scheduledLeads = patients.filter(p => p.status === 'Scheduled').length;

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  /**
   * Sorts tasks based on user selection.
   * Currently supports sorting by 'dueDate' (chronological) or 'patientName' (alphabetical).
   */
  const sortTasks = (tasksList: typeof tasks, sortBy: 'dueDate' | 'patientName') => {
    return [...tasksList].sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      } else {
        return (a.patientName || '').localeCompare(b.patientName || '');
      }
    });
  };

  const sortedPendingTasks = sortTasks(pendingTasks, pendingSortBy);
  const sortedCompletedTasks = sortTasks(completedTasks, completedSortBy);

  const handleBookAppointment = () => {
    if (selectedPatient) {
      const updatedTimeline = [
        ...(selectedPatient.timeline || []),
        { date: new Date().toISOString(), event: 'Appointment Booked' }
      ];
      
      updatePatient(selectedPatient.id, {
        status: 'Scheduled',
        timeline: updatedTimeline
      });
      
      setSelectedPatient({
        ...selectedPatient,
        status: 'Scheduled',
        timeline: updatedTimeline
      });
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Main Dashboard Area */}
      <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${selectedPatient ? 'md:mr-96' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinic Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage leads, view AI summaries, and track patient journeys.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Leads</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totalLeads}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">New / Analyzed</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{newLeads}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contacted</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">{contactedLeads}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Scheduled</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">{scheduledLeads}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center z-10 shrink-0">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <ListTodo className="w-5 h-5 mr-2 text-indigo-600" />
                  Pending Tasks ({pendingTasks.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-medium">Sort:</span>
                  <select
                    value={pendingSortBy}
                    onChange={(e) => setPendingSortBy(e.target.value as 'dueDate' | 'patientName')}
                    className="text-xs font-medium border-gray-200 rounded-lg py-1.5 pl-2 pr-8 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="patientName">Patient Name</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {pendingTasks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No pending tasks.</div>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    {sortedPendingTasks.map(task => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        key={task.id} 
                        className="p-4 flex items-start hover:bg-gray-50 transition-colors"
                      >
                        <button 
                          onClick={() => updateTask(task.id, { completed: true })}
                          className="mt-0.5 mr-3 flex-shrink-0 text-gray-400 hover:text-green-500 transition-colors"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          {task.description && <p className="text-xs mt-1 text-gray-500">{task.description}</p>}
                          <div className="flex items-center mt-2 space-x-4">
                            {task.patientName && (
                              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {task.patientName}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs flex items-center text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center z-10 shrink-0">
                <h2 className="text-lg font-bold text-gray-900 flex items-center text-gray-500">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Completed Tasks ({completedTasks.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-medium">Sort:</span>
                  <select
                    value={completedSortBy}
                    onChange={(e) => setCompletedSortBy(e.target.value as 'dueDate' | 'patientName')}
                    className="text-xs font-medium border-gray-200 rounded-lg py-1.5 pl-2 pr-8 focus:ring-green-500 focus:border-green-500 bg-white text-gray-500"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="patientName">Patient Name</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-100 overflow-y-auto flex-1 opacity-75">
                {completedTasks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No completed tasks.</div>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    {sortedCompletedTasks.map(task => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        key={task.id} 
                        className="p-4 flex items-start hover:bg-gray-50 transition-colors"
                      >
                        <button 
                          onClick={() => updateTask(task.id, { completed: false })}
                          className="mt-0.5 mr-3 flex-shrink-0 text-green-500 hover:text-gray-400 transition-colors"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-400 line-through">{task.title}</p>
                          {task.description && <p className="text-xs mt-1 text-gray-400">{task.description}</p>}
                          <div className="flex items-center mt-2 space-x-4">
                            {task.patientName && (
                              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                {task.patientName}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs flex items-center text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search name or interest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Interest Segment</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Intent Score</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => setSelectedPatient(patient)}
                      className={`cursor-pointer transition-colors ${selectedPatient?.id === patient.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{patient.firstName} {patient.lastName}</div>
                            <div className="text-xs text-gray-500">{patient.source}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.interest}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            patient.intent === 'High' ? 'bg-green-100 text-green-800' :
                            patient.intent === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.intent} ({patient.leadScore}/10)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          patient.status === 'Scheduled' ? 'bg-green-100 text-green-700 border border-green-200' :
                          patient.status === 'Contacted' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Detail Panel */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col pt-16 md:pt-0"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center mt-1.5 gap-2 sm:gap-4">
                      <div className="flex items-center text-sm text-gray-500 truncate">
                        <Mail className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 truncate">
                        <Phone className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedPatient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Primary Interest</p>
                     <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-flex items-center">
                       {selectedPatient.interest}
                     </span>
                   </div>
                   <div>
                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Current Status</p>
                     <span className="text-sm font-semibold text-gray-900 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md inline-block">
                       {selectedPatient.status}
                     </span>
                   </div>
                </div>
              </div>

              {/* AI Summary Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-100 p-4 rounded-bl-3xl">
                  <BrainCircuit className="w-6 h-6 text-indigo-600 opacity-80" />
                </div>
                <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                  <span className="bg-indigo-600 w-1.5 h-6 rounded-full mr-3"></span>
                  AI Intake Summary
                </h4>
                <p className="text-base text-gray-800 leading-relaxed font-medium mb-6 relative z-10">
                  {selectedPatient.aiSummary}
                </p>
                <div className="bg-white p-4 rounded-xl border border-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-2 relative z-10">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-indigo-500 mr-2" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suggested Track</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg text-center sm:text-right w-full sm:w-auto">{selectedPatient.suggestedFollowUp}</span>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Intake Data</h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">Interest</dt>
                    <dd className="text-gray-900 font-semibold mt-1">{selectedPatient.interest}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Source</dt>
                    <dd className="text-gray-900 font-semibold mt-1">{selectedPatient.source}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Pref. Contact</dt>
                    <dd className="text-gray-900 font-semibold mt-1">{selectedPatient.contactMethod}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Best Time</dt>
                    <dd className="text-gray-900 font-semibold mt-1">{selectedPatient.bestTime}</dd>
                  </div>
                  {(selectedPatient as any).lifestyle && (
                    <div className="col-span-2">
                      <dt className="text-gray-500 font-medium">Lifestyle Info</dt>
                      <dd className="text-gray-900 font-semibold mt-1">{(selectedPatient as any).lifestyle}</dd>
                    </div>
                  )}
                  {(selectedPatient as any).voiceNotes && (
                    <div className="col-span-2">
                      <dt className="text-gray-500 font-medium">Voice Intake Transcribed</dt>
                      <dd className="text-gray-900 font-semibold mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                        "{(selectedPatient as any).voiceNotes}"
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Communications Status */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Communications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Email Sequence</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      {selectedPatient.communications?.emails?.length || 0} Generated
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">SMS Sequence</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      {selectedPatient.communications?.sms?.length || 0} Generated
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Appointment CTA</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${selectedPatient.appointmentClicked ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {selectedPatient.appointmentClicked ? 'Clicked' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Journey Timeline</h4>
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-4">
                  {selectedPatient.timeline.map((item, index) => (
                    <div key={index} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
                      <p className="text-sm font-semibold text-gray-900">{item.event}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedPatient.status !== 'Scheduled' && (
                <div className="pt-4 pb-8">
                  <button
                    onClick={handleBookAppointment}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment Manually
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
