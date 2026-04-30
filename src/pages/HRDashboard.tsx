import React, { useState, useEffect, useCallback } from 'react';
import { useDemo } from '../store/DemoContext';
import { 
  Users, 
  AlertTriangle, 
  TrendingDown, 
  Activity, 
  ChevronRight, 
  Search, 
  Filter, 
  Clock, 
  BrainCircuit, 
  Mic, 
  FileText,
  Briefcase,
  Target,
  Bell,
  X,
  Volume2,
  Sparkles,
  StopCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSpeech, generateSpeech } from '../services/gemini';

const API_BASE = 'http://localhost:3000/api';

export const HRDashboard = () => {
  const { employeeRisks, updateEmployeeRisk, refreshEmployeeRisks } = useDemo();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingAction, setPendingAction] = useState<'review' | 'motivation' | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Refresh data on mount
  useEffect(() => {
    refreshEmployeeRisks();
  }, [refreshEmployeeRisks]);

  const startRecording = async () => {
    setIsRecording(true);
    setSpeechAnalysis(null);
    setAudioUrl(null);
    
    // Simulate recording duration
    setTimeout(async () => {
      setIsRecording(false);
      setIsAnalyzing(true);
      
      try {
        // Call the API endpoint for speech analysis
        const response = await fetch(`${API_BASE}/analyze-speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text_context: `Employee ${selectedStaff.name} is in ${selectedStaff.department}. They have a ${selectedStaff.turnoverRisk} risk level. Their current notes are: ${selectedStaff.notes}. Please simulate a 1-sentence feedback they might give and analyze it.`
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          setSpeechAnalysis(result);
          
          // Use TTS to read back the suggestion
          if (result.suggestedIntervention) {
            const ttsUrl = await generateSpeech(result.suggestedIntervention);
            if (ttsUrl) setAudioUrl(ttsUrl);
          }
        } else {
          // Fallback to local analysis if API fails
          const result = await analyzeSpeech(undefined, `Employee ${selectedStaff.name} is in ${selectedStaff.department}. They have a ${selectedStaff.turnoverRisk} risk level. Their current notes are: ${selectedStaff.notes}. Please simulate a 1-sentence feedback they might give and analyze it.`);
          if (result) {
            setSpeechAnalysis(result);
            if (result.suggestedIntervention) {
              const ttsUrl = await generateSpeech(result.suggestedIntervention);
              if (ttsUrl) setAudioUrl(ttsUrl);
            }
          }
        }
      } catch (error) {
        console.error('Speech analysis error:', error);
        // Fallback to local analysis
        const result = await analyzeSpeech(undefined, `Employee ${selectedStaff.name} is in ${selectedStaff.department}. They have a ${selectedStaff.turnoverRisk} risk level. Their current notes are: ${selectedStaff.notes}.`);
        if (result) {
          setSpeechAnalysis(result);
        }
      }
      
      setIsAnalyzing(false);
    }, 2500);
  };

  // Handle updating HR risk via API
  const handleUpdateRisk = useCallback(async (id: string, data: any) => {
    try {
      const res = await fetch(`${API_BASE}/hr-risks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await refreshEmployeeRisks();
      }
    } catch (error) {
      console.error('Error updating risk:', error);
    }
  }, [refreshEmployeeRisks]);

  const filteredStaff = employeeRisks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highRiskEmployees = employeeRisks.filter(s => s.turnoverRisk === 'High');

  const stats = {
    totalStaff: employeeRisks.length,
    highRisk: highRiskEmployees.length,
    avgMotivation: employeeRisks.length > 0 
      ? Math.round(employeeRisks.reduce((acc, curr) => acc + curr.motivationLevel, 0) / employeeRisks.length)
      : 0,
    avgPerformance: employeeRisks.length > 0
      ? Math.round(employeeRisks.reduce((acc, curr) => acc + curr.performanceScore, 0) / employeeRisks.length)
      : 0,
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Main HR Dashboard Area */}
      <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${selectedStaff ? 'md:mr-96' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organizational Performance & Risk</h1>
              <p className="text-gray-500 mt-1">Quantifying workforce dynamics and burnout risk mitigation.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {highRiskEmployees.length > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold">
                        {highRiskEmployees.length}
                      </span>
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowNotifications(false)}
                      ></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                          <h3 className="font-bold text-gray-900 flex items-center">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                            Critical Risk Alerts
                          </h3>
                          <button onClick={() => setShowNotifications(false)}>
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {highRiskEmployees.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-sm">
                              No critical risks detected.
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {highRiskEmployees.map(emp => (
                                <div key={emp.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-gray-900">{emp.name}</span>
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">High Risk</span>
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                    {emp.notes}
                                  </p>
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter italic">Suggested Intervention:</p>
                                    <button 
                                      onClick={() => {
                                        setSelectedStaff(emp);
                                        setPendingAction('review');
                                        setShowNotifications(false);
                                      }}
                                      className="w-full text-left p-2 bg-indigo-50 rounded-lg text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center justify-between group/btn"
                                    >
                                      Initiate Intervention Profile
                                      <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            Clear all notifications
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Workforce</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Critical Risk (Burnout)</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">{stats.highRisk}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Motivation</p>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.avgMotivation}%</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Performance Index</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">{stats.avgPerformance}%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search staff, department..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-200">
                <Filter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => refreshEmployeeRisks()}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 px-3"
              >
                Update All Metrics
              </button>
            </div>
          </div>

          {/* Staff List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dept / Position</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Motivation</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Sick Days (Q)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((staff) => (
                    <tr 
                      key={staff.id} 
                      onClick={() => {
                        setSelectedStaff(staff);
                        setPendingAction(null);
                      }}
                      className={`cursor-pointer transition-colors ${selectedStaff?.id === staff.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                              {staff.name[0]}
                            </div>
                            {staff.turnoverRisk === 'High' && (
                              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white shadow-sm">
                                <AlertTriangle className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-gray-900">{staff.name}</div>
                              {staff.turnoverRisk === 'High' && (
                                <span className="text-[8px] font-black bg-red-600 text-white px-1 py-0.5 rounded leading-none uppercase tracking-tighter">Impact Risk</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">ID: {staff.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{staff.department}</div>
                        <div className="text-xs text-gray-500">{staff.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className={`h-1.5 rounded-full ${staff.motivationLevel < 40 ? 'bg-red-500' : staff.motivationLevel < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                              style={{ width: `${staff.motivationLevel}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-gray-700">{staff.motivationLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${staff.sickDaysLastQuarter > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {staff.sickDaysLastQuarter}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          staff.turnoverRisk === 'High' ? 'bg-red-100 text-red-800' :
                          staff.turnoverRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {staff.turnoverRisk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Analysis Panel */}
      <AnimatePresence>
        {selectedStaff && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 mt-16 md:mt-0">
              <h2 className="text-xl font-bold text-gray-900">Risk Analysis</h2>
              <button 
                onClick={() => {
                  setSelectedStaff(null);
                  setPendingAction(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                id="close-hr-panel"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
              
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                  {selectedStaff.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStaff.position} • {selectedStaff.department}</p>
                </div>
              </div>

              {/* Quantified Risk Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-100 p-4 rounded-bl-3xl">
                  <BrainCircuit className="w-6 h-6 text-indigo-600 opacity-80" />
                </div>
                <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                  <span className="bg-indigo-600 w-1.5 h-6 rounded-full mr-3"></span>
                  AI Performance Audit
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed font-medium mb-6">
                  {selectedStaff.notes || 'No notes available.'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-indigo-50">
                    <p className="text-xs text-gray-500 mb-1">Avg Lateness</p>
                    <p className="text-lg font-bold text-gray-900">{selectedStaff.averageLateness || 0}m/wk</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-50">
                    <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                    <p className={`text-lg font-bold ${selectedStaff.turnoverRisk === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedStaff.turnoverRisk === 'High' ? 'CRITICAL' : 'STABLE'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow Paperwork / Survey */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Confidential Intake</h4>
                <div className="space-y-4">
                  <div>
                    <dt className="text-xs font-bold text-gray-500 mb-1 flex items-center justify-between">
                      <div className="flex items-center">
                        <Mic className="w-3 h-3 mr-1" />
                        VOICE-TO-TEXT ANALYSIS
                      </div>
                      {!selectedStaff.voiceIntake && !speechAnalysis && !isRecording && !isAnalyzing && (
                        <button 
                          onClick={startRecording}
                          className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700 underline"
                        >
                          Record Feedback
                        </button>
                      )}
                    </dt>
                    
                    <dd className="mt-2">
                       {isRecording ? (
                         <div className="flex items-center justify-center p-6 bg-red-50 border border-red-100 rounded-xl space-x-3 text-red-600">
                           <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-3 h-3 bg-red-500 rounded-full"
                           />
                           <span className="text-xs font-black uppercase tracking-widest">Listening...</span>
                           <button onClick={() => setIsRecording(false)}>
                             <StopCircle className="w-5 h-5" />
                           </button>
                         </div>
                       ) : isAnalyzing ? (
                         <div className="flex items-center justify-center p-6 bg-indigo-50 border border-indigo-100 rounded-xl space-x-3 text-indigo-600">
                           <Sparkles className="w-5 h-5 animate-spin" />
                           <span className="text-xs font-black uppercase tracking-widest">AI Analysis...</span>
                         </div>
                       ) : speechAnalysis ? (
                         <div className="space-y-4">
                           <div className="text-sm text-gray-900 bg-white p-4 rounded-xl italic border border-indigo-100 shadow-sm">
                             "{speechAnalysis.transcription}"
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 mb-0.5">SENTIMENT</p>
                                <p className={`text-xs font-bold ${speechAnalysis.sentiment === 'Negative' || speechAnalysis.sentiment === 'Critical' ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {speechAnalysis.sentiment}
                                </p>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 mb-0.5">TONE INDEX</p>
                                <p className="text-xs font-bold text-slate-900">{speechAnalysis.toneIndex}/100</p>
                              </div>
                           </div>
                           <div className="bg-indigo-600 p-4 rounded-xl text-white shadow-lg shadow-indigo-200">
                              <h5 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                                AI Suggestion
                                {audioUrl && (
                                  <button 
                                    onClick={() => {
                                      const audio = new Audio(audioUrl);
                                      audio.play();
                                    }}
                                    className="p-1 hover:bg-white/20 rounded-md transition-colors"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                )}
                              </h5>
                              <p className="text-xs font-bold leading-relaxed">{speechAnalysis.suggestedIntervention}</p>
                           </div>
                           
                           {/* Contextual Action Buttons */}
                           <div className="grid grid-cols-1 gap-2">
                             <button 
                               onClick={() => setPendingAction('review')}
                               className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all group/aud"
                             >
                               <div className="flex items-center gap-2">
                                 <Briefcase className="w-3 h-3 text-indigo-600" />
                                 Schedule Review
                               </div>
                               <ChevronRight className="w-3 h-3 text-slate-400 group-hover/aud:translate-x-1 transition-transform" />
                             </button>
                             <button 
                               onClick={() => setPendingAction('motivation')}
                               className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all group/mot"
                             >
                               <div className="flex items-center gap-2">
                                 <Target className="w-3 h-3 text-rose-600" />
                                 Apply Motivation Pkg
                               </div>
                               <ChevronRight className="w-3 h-3 text-slate-400 group-hover/mot:translate-x-1 transition-transform" />
                             </button>
                           </div>

                           <button 
                            onClick={() => {
                              setSpeechAnalysis(null);
                              setAudioUrl(null);
                            }}
                            className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                           >
                             Reset Voice Analysis
                           </button>
                         </div>
                       ) : (
                         <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-xl italic border border-gray-100">
                           "{selectedStaff.voiceIntake || 'No voice intake captured.'}"
                         </div>
                       )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-bold text-gray-500 mb-1">LATE REASON</dt>
                      <dd className="text-sm font-semibold">{selectedStaff.surveyResults?.reasonForLate || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-gray-500 mb-1">MOTIVATION DRIVERS</dt>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedStaff.surveyResults?.motivationDrivers?.map((d: string) => (
                          <span key={d} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{d}</span>
                        )) || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Board */}
              <div className="pt-4 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center">
                  Intervention Protocol
                  {pendingAction && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full animate-pulse">
                      Urgent Action Pending
                    </span>
                  )}
                </h4>
                <button 
                  onClick={async () => {
                    if (pendingAction === 'review') {
                      // Create intervention via API
                      try {
                        await fetch(`${API_BASE}/interventions`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            employee_id: selectedStaff.id,
                            type: 'meeting',
                            description: `Performance review scheduled for ${selectedStaff.name}`,
                            status: 'pending'
                          })
                        });
                      } catch (error) {
                        console.error('Error creating intervention:', error);
                      }
                    }
                    setPendingAction(null);
                  }}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white transition-all ${
                    pendingAction === 'review' 
                      ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-100 scale-[1.02]' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  {pendingAction === 'review' 
                    ? `Execute Review: ${selectedStaff.name}` 
                    : 'Schedule Performance Review'}
                </button>
                <button 
                  onClick={async () => {
                    if (pendingAction === 'motivation') {
                      // Update motivation level via API
                      await handleUpdateRisk(selectedStaff.id, {
                        motivation_level: Math.min(100, (selectedStaff.motivationLevel || 0) + 10)
                      });
                    }
                    setPendingAction(null);
                  }}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 border text-sm font-medium rounded-xl transition-all ${
                    pendingAction === 'motivation'
                      ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 scale-[1.02]'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Target className="w-5 h-5 mr-2" />
                  {pendingAction === 'motivation'
                    ? `Assign Package to ${selectedStaff.name}`
                    : 'Assign Motivational Package'}
                </button>
                
                {pendingAction && (
                  <button 
                    onClick={() => setPendingAction(null)}
                    className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 mt-2"
                  >
                    Dismiss Recommendation
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
