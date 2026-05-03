import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Database,
  Sparkles,
  X,
  FileSpreadsheet,
  FileJson,
  File,
  Loader2,
  Download,
  Eye
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: 'csv' | 'json' | 'xml' | 'pdf' | 'xlsx';
  status: 'uploading' | 'parsing' | 'analyzed' | 'error';
  recordCount?: number;
  columns?: string[];
  insights?: string[];
  errors?: string[];
}

const FILE_TYPE_ICONS: Record<string, any> = {
  csv: FileSpreadsheet,
  json: FileJson,
  xml: File,
  pdf: FileText,
  xlsx: FileSpreadsheet,
};

const SAMPLE_DATA_TYPES = [
  { id: 'hris', label: 'HRIS Export', desc: 'Workday, BambooHR, ADP employee data', formats: ['CSV', 'JSON'] },
  { id: 'attendance', label: 'Time & Attendance', desc: 'Clock-in/out records, shift data', formats: ['CSV', 'XLSX'] },
  { id: 'performance', label: 'Performance Reviews', desc: 'Annual/quarterly review scores', formats: ['CSV', 'JSON'] },
  { id: 'claims', label: 'Workers Comp Claims', desc: 'Injury claims and costs', formats: ['CSV', 'PDF'] },
  { id: 'motion', label: '3D Motion Capture', desc: 'KinetSense, DARI Motion exports', formats: ['JSON', 'CSV', 'XML'] },
  { id: 'wearable', label: 'Wearable Device Data', desc: 'Apple Health, Garmin, Fitbit exports', formats: ['JSON', 'CSV'] },
  { id: 'survey', label: 'Employee Surveys', desc: 'SurveyMonkey, Culture Amp exports', formats: ['CSV', 'JSON'] },
  { id: 'benefits', label: 'Benefits Utilization', desc: 'Insurance claims, EAP usage', formats: ['CSV', 'XLSX'] },
];

export const DataImport = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'individual' | 'correlate'>('individual');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'csv';
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: file.size,
        type: ext as any,
        status: 'uploading'
      };
    });

    setFiles(prev => [...prev, ...uploadedFiles]);

    // Simulate processing
    uploadedFiles.forEach((file, index) => {
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'parsing' } : f));
      }, 500 + index * 300);

      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === file.id ? {
          ...f,
          status: 'analyzed',
          recordCount: Math.floor(Math.random() * 500) + 50,
          columns: generateColumns(file.name),
          insights: generateInsights(file.name),
        } : f));
      }, 2000 + index * 500);
    });
  };

  const generateColumns = (filename: string): string[] => {
    if (filename.includes('attendance') || filename.includes('time')) {
      return ['employee_id', 'date', 'clock_in', 'clock_out', 'hours_worked', 'overtime', 'department'];
    }
    if (filename.includes('performance') || filename.includes('review')) {
      return ['employee_id', 'review_date', 'score', 'manager_rating', 'goals_met', 'comments'];
    }
    if (filename.includes('motion') || filename.includes('capture')) {
      return ['session_id', 'joint', 'rom_degrees', 'symmetry', 'compensation', 'timestamp'];
    }
    return ['id', 'employee_name', 'department', 'date', 'value', 'category', 'notes'];
  };

  const generateInsights = (filename: string): string[] => {
    return [
      'Data quality: 94% complete (6% missing values in optional fields)',
      'Detected 3 anomalies requiring review',
      'Strong correlation found between attendance and performance scores',
      'Department-level patterns identified in Operations and Clinical teams',
      'Recommended: Cross-reference with clinical assessment data',
    ];
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hr/assessment')} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                Raw Data Import & Analysis
              </h1>
              <p className="text-gray-500 mt-1">Upload third-party data (CSV, JSON, XML) for AI-powered analysis and correlation</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAnalysisMode('individual')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                analysisMode === 'individual' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Individual Analysis
            </button>
            <button
              onClick={() => setAnalysisMode('correlate')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                analysisMode === 'correlate' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Cross-Correlate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isDragging ? 'Drop files here...' : 'Upload Raw Data Files'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag & drop files or click to browse. Supports CSV, JSON, XML, XLSX, PDF
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 cursor-pointer transition-all shadow-sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
                <input
                  type="file"
                  multiple
                  accept=".csv,.json,.xml,.xlsx,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Uploaded Files ({files.length})</h3>
                  <button
                    onClick={() => { setFiles([]); setSelectedFile(null); }}
                    className="text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {files.map(file => {
                    const Icon = FILE_TYPE_ICONS[file.type] || File;
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedFile?.id === file.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            file.status === 'analyzed' ? 'bg-emerald-100' :
                            file.status === 'error' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              file.status === 'analyzed' ? 'text-emerald-600' :
                              file.status === 'error' ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatSize(file.size)}
                              {file.recordCount && ` • ${file.recordCount} records`}
                              {file.columns && ` • ${file.columns.length} columns`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'uploading' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                          {file.status === 'parsing' && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                          {file.status === 'analyzed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {file.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            file.status === 'analyzed' ? 'bg-emerald-100 text-emerald-700' :
                            file.status === 'error' ? 'bg-red-100 text-red-700' :
                            file.status === 'parsing' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {file.status}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {selectedFile?.status === 'analyzed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    AI Analysis: {selectedFile.name}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Columns Detected */}
                  {selectedFile.columns && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detected Columns</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFile.columns.map(col => (
                          <span key={col} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {selectedFile.insights && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Insights</p>
                      <div className="space-y-2">
                        {selectedFile.insights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-indigo-50 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-indigo-900">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Generate Full Report
                    </button>
                    <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Supported Data Types Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Supported Data Types</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {SAMPLE_DATA_TYPES.map(dt => (
                  <div key={dt.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-semibold text-gray-900">{dt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{dt.desc}</p>
                    <div className="flex gap-1 mt-2">
                      {dt.formats.map(f => (
                        <span key={f} className="text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation Panel */}
            {analysisMode === 'correlate' && files.filter(f => f.status === 'analyzed').length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg"
              >
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Cross-Correlation Ready
                </h3>
                <p className="text-xs text-white/70 mb-4">
                  {files.filter(f => f.status === 'analyzed').length} datasets ready for cross-analysis.
                  AI will find patterns between clinical and HR data.
                </p>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
                  Run Cross-Correlation →
                </button>
              </motion.div>
            )}

            {/* Quick Tips */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
              <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Data Tips
              </h3>
              <ul className="space-y-2 text-xs text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Include employee IDs for cross-referencing between datasets
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Date formats are auto-detected (ISO, US, EU)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  PII data is processed locally and never stored externally
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Upload multiple files to enable cross-correlation mode
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
