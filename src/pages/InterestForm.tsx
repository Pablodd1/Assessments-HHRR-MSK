import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../store/DemoContext';
import { CheckCircle2, ChevronRight, Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const InterestForm = () => {
  const navigate = useNavigate();
  const { currentPatient, setCurrentPatient } = useDemo();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscription(prev => prev + finalTranscript);
      setCurrentPatient(prev => ({ ...prev, voiceNotes: (prev.voiceNotes || '') + finalTranscript }));
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full space-y-6"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Intake Complete</h2>
          <p className="text-gray-500">
            Thank you for sharing your goals. We are now analyzing your profile to personalize your experience.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/analysis')}
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              View AI Analysis
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Tell us about your goals</h2>
          <p className="mt-2 text-gray-500">This helps us tailor your educational content.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 border bg-gray-50"
                  onChange={e => setCurrentPatient({ ...currentPatient, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 border bg-gray-50"
                  onChange={e => setCurrentPatient({ ...currentPatient, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 border bg-gray-50"
                  onChange={e => setCurrentPatient({ ...currentPatient, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 border bg-gray-50"
                  onChange={e => setCurrentPatient({ ...currentPatient, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Voice Intake Section */}
          <div className="space-y-4 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-indigo-900">Voice Intake (Optional)</h3>
              <div className="flex items-center text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                <Mic className="w-4 h-4 mr-1" />
                Hands-free
              </div>
            </div>
            <p className="text-sm text-indigo-700">
              Prefer to talk? Tell us about your symptoms, lifestyle goals, or any specific concerns you have. We'll transcribe it for your clinician.
            </p>
            
            <div className="flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 animate-pulse scale-110' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </button>
              <p className="text-xs font-bold text-indigo-800 uppercase">
                {isRecording ? 'Recording... Click to stop' : 'Click to start talking'}
              </p>
            </div>

            {transcription && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-200 text-sm text-gray-700 italic">
                "{transcription}"
              </div>
            )}
          </div>

          {/* Detailed Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Wellness Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Interest</label>
              <select
                required
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border bg-gray-50"
                onChange={e => setCurrentPatient({ ...currentPatient, interest: e.target.value })}
              >
                <option value="">Select an option...</option>
                <option value="Energy Support">Energy Support</option>
                <option value="Recovery and Performance">Recovery and Performance</option>
                <option value="Sleep and Stress Support">Sleep and Stress Support</option>
                <option value="Longevity and Wellness">Longevity and Wellness</option>
                <option value="Body Composition Support">Body Composition Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Lifestyle (Optional)</label>
              <textarea
                className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 border bg-gray-50"
                rows={3}
                placeholder="Briefly describe your current activity level, diet, or sleep patterns..."
                onChange={e => setCurrentPatient({ ...currentPatient, lifestyle: e.target.value })}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Contact</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border bg-gray-50"
                  onChange={e => setCurrentPatient({ ...currentPatient, contactMethod: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Best Time</label>
                <select
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border bg-gray-50"
                  onChange={e => setCurrentPatient({ ...currentPatient, bestTime: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                required
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="consent" className="font-medium text-gray-700">
                I consent to receive educational communications
              </label>
              <p className="text-gray-500 text-xs mt-1">
                By checking this box, you agree to receive emails and text messages. You can opt out at any time.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Submit Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

