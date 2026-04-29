import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../store/DemoContext';
import { analyzePatientIntake, generateSpeech } from '../services/gemini';
import { BrainCircuit, Loader2, ChevronRight, AlertTriangle, CheckCircle2, Volume2, VolumeX, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIAnalysis = () => {
  const navigate = useNavigate();
  const { currentPatient, setCurrentPatient, updatePatient } = useDemo();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (currentPatient.firstName) {
        const result = await analyzePatientIntake(currentPatient);
        if (result) {
          setAnalysisResult(result);
          setCurrentPatient({ ...currentPatient, ...result, status: 'Analyzed' });
          if (currentPatient.id) {
            updatePatient(currentPatient.id, { ...result, status: 'Analyzed' });
          }
        } else {
          // Fallback if API fails
          const fallback = {
            segment: currentPatient.interest ? `Individual Seeking ${currentPatient.interest}` : 'General Wellness Seeker',
            leadScore: 7,
            intent: 'Medium',
            suggestedFollowUp: 'Educational Email Sequence + SMS Scheduling Prompt',
            internalSummary: `Patient is interested in ${currentPatient.interest}. Educational content recommended. No diagnosis inferred. Best next step is clinician-led consultation.`,
            keyGoals: ['Improve overall wellness', 'Establish healthy routines'],
            recommendedResources: ['Introduction to Wellness Optimization', 'Daily Routine Checklist']
          };
          setAnalysisResult(fallback);
          setCurrentPatient({ ...currentPatient, ...fallback, status: 'Analyzed' });
        }
      } else {
        // Mock data if accessed directly
        const mock = {
          segment: 'High-Performance Individual Seeking Recovery',
          leadScore: 8,
          intent: 'High',
          suggestedFollowUp: 'Send "Executive Energy Protocol" Sequence + SMS Scheduling Prompt',
          internalSummary: 'Patient is interested in recovery support, energy, and better routines. No diagnosis inferred. Best next step is clinician-led consultation.',
          keyGoals: ['Optimize recovery time', 'Increase daily energy levels', 'Improve sleep quality'],
          recommendedResources: ['The Science of Active Recovery', 'Sleep Hygiene Protocol']
        };
        setAnalysisResult(mock);
      }
      
      setIsAnalyzing(false);
    };

    runAnalysis();
  }, []);

  const handleSpeak = async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
      setIsSpeaking(true);
      return;
    }

    const textToSpeak = `Hello ${currentPatient.firstName || 'there'}. Based on our analysis, your interest segment is ${analysisResult?.segment}. We have prepared a ${analysisResult?.suggestedFollowUp} for you. We look forward to supporting your wellness journey.`;
    const url = await generateSpeech(textToSpeak);
    if (url) {
      setAudioUrl(url);
      const audio = new Audio(url);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
      setIsSpeaking(true);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 mr-3 text-indigo-600" />
            AI Intake Processing
          </h2>
          <p className="mt-2 text-gray-500">
            The system automatically analyzes intake data to segment the patient and suggest a follow-up track.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden">
          {/* Disclaimer Banner */}
          <div className="absolute top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-100 p-2 flex items-center justify-center text-xs text-yellow-800 font-medium">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Demo AI Summary - Educational workflow only, not diagnosis.
          </div>

          <div className="pt-8">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Analyzing patient data...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <div className="flex items-center">
                    <Volume2 className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-semibold text-indigo-900">Audio Summary Available</span>
                  </div>
                  <button
                    onClick={handleSpeak}
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isSpeaking 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                    }`}
                  >
                    {isSpeaking ? <><VolumeX className="w-4 h-4 mr-2" /> Stop</> : <><Volume2 className="w-4 h-4 mr-2" /> Listen</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Detailed Segment</p>
                    <p className="text-lg font-bold text-gray-900">{analysisResult?.segment}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lead Score</p>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-indigo-600">{analysisResult?.leadScore}</span>
                        <span className="text-gray-400 ml-1">/10</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Intent</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        analysisResult?.intent === 'High' ? 'bg-green-100 text-green-800' :
                        analysisResult?.intent === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {analysisResult?.intent}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-1" /> Key Goals Identified
                    </p>
                    <ul className="space-y-2">
                      {analysisResult?.keyGoals?.map((goal: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-indigo-900">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" /> Recommended Resources
                    </p>
                    <ul className="space-y-2">
                      {analysisResult?.recommendedResources?.map((resource: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-blue-900">
                          <ChevronRight className="w-4 h-4 mr-1 text-blue-500 shrink-0 mt-0.5" />
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Follow-Up Track</p>
                  <p className="text-gray-900 font-medium">
                    {analysisResult?.suggestedFollowUp}
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Summary (Clinician View)</p>
                  <p className="text-gray-700 italic border-l-4 border-indigo-300 pl-4 py-1">
                    "{analysisResult?.internalSummary}"
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={() => navigate('/communications')}
                    className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                  >
                    View Generated Communications
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

