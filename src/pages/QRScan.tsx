import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Smartphone, ChevronDown } from 'lucide-react';
import { useDemo } from '../store/DemoContext';
import { motion } from 'framer-motion';

export const QRScan = () => {
  const navigate = useNavigate();
  const { currentPatient, setCurrentPatient } = useDemo();
  const [isScanning, setIsScanning] = useState(false);

  const sources = ['Front Desk QR', 'Event Flyer QR', 'Referral Card QR'];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      navigate('/landing');
    }, 1500);
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Patient Entry Point</h2>
          <p className="mt-2 text-gray-500">Simulate a patient scanning a QR code to start their journey.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center space-y-8">
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Simulated Source Tag</label>
            <div className="relative">
              <select
                value={currentPatient.source || 'Front Desk QR'}
                onChange={(e) => setCurrentPatient({ ...currentPatient, source: e.target.value })}
                className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border appearance-none bg-gray-50"
              >
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative w-64 h-64 bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-gray-200">
            <QrCode className="w-32 h-32 text-gray-400" />
            
            {isScanning && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
              />
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            {isScanning ? 'Scanning...' : 'Simulate Scan'}
          </button>
        </div>
      </div>
    </div>
  );
};
