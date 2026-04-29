import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Map, LayoutDashboard } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Interactive Patient Workflow Demo
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            See how a patient moves from QR scan to consultation scheduling in a modern, compliant wellness clinic environment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-8">
          <button
            onClick={() => navigate('/qr')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Demo
          </button>
          <button
            onClick={() => navigate('/workflow')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-gray-300 shadow-sm text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Map className="w-5 h-5 mr-2" />
            View Workflow Map
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-gray-300 shadow-sm text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Clinic Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
