import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  RefreshCcw,
  Users,
  AlertTriangle,
  ArrowRight,
  Zap,
  DollarSign,
  Clock,
  TrendingDown,
  Brain
} from 'lucide-react';

interface CycleNode {
  id: string;
  name: string;
  department: string;
  event: string;
  timestamp: string;
  impact: string[];
  costImpact: number;
}

interface CascadeChain {
  id: string;
  triggerEvent: string;
  triggerEmployee: string;
  department: string;
  date: string;
  chainLength: number;
  totalCost: number;
  nodes: CycleNode[];
}

const SAMPLE_CASCADES: CascadeChain[] = [
  {
    id: 'c1',
    triggerEvent: 'Sick day (flu)',
    triggerEmployee: 'Robert Wilson',
    department: 'Operations',
    date: '2026-04-15',
    chainLength: 5,
    totalCost: 4250,
    nodes: [
      { id: 'n1', name: 'Robert Wilson', department: 'Operations', event: 'Calls in sick (flu)', timestamp: '6:00 AM', impact: ['Maria covers double shift'], costImpact: 200 },
      { id: 'n2', name: 'Maria Torres', department: 'Operations', event: 'Works double shift (16hrs)', timestamp: '7:00 AM', impact: ['Exhaustion', 'Makes 2 errors', 'Goes home early next day'], costImpact: 650 },
      { id: 'n3', name: 'Maria Torres', department: 'Operations', event: 'Leaves 3hrs early (exhaustion)', timestamp: 'Next day 2:00 PM', impact: ['Kevin covers remaining shift'], costImpact: 450 },
      { id: 'n4', name: 'Kevin Park', department: 'IT', event: 'Pulled from IT to cover Operations', timestamp: 'Next day 2:00 PM', impact: ['IT ticket backlog grows', 'Misses deadline'], costImpact: 800 },
      { id: 'n5', name: 'Kevin Park', department: 'IT', event: 'Works weekend to catch up (overtime)', timestamp: 'Saturday', impact: ['Overtime pay', 'Burnout risk increases'], costImpact: 1200 },
    ]
  },
  {
    id: 'c2',
    triggerEvent: 'Childcare emergency',
    triggerEmployee: 'Sarah Mitchell',
    department: 'Administrative',
    date: '2026-04-22',
    chainLength: 4,
    totalCost: 2800,
    nodes: [
      { id: 'n6', name: 'Sarah Mitchell', department: 'Administrative', event: 'Emergency childcare pickup', timestamp: '10:30 AM', impact: ['Report deadline missed', 'Team redistributes work'], costImpact: 300 },
      { id: 'n7', name: 'Lisa Chen', department: 'Administrative', event: 'Takes on Sarah\'s urgent report', timestamp: '11:00 AM', impact: ['Own tasks delayed', 'Stays 2hrs late'], costImpact: 400 },
      { id: 'n8', name: 'Lisa Chen', department: 'Administrative', event: 'Arrives 45min late next morning (exhaustion)', timestamp: 'Next day 9:45 AM', impact: ['Morning meeting missed', 'Client call delayed'], costImpact: 600 },
      { id: 'n9', name: 'Rachel Adams', department: 'Sales', event: 'Handles delayed client call (unprepared)', timestamp: 'Next day 10:00 AM', impact: ['Client frustration', 'Deal delayed 1 week'], costImpact: 1500 },
    ]
  },
  {
    id: 'c3',
    triggerEvent: 'Burnout sick day',
    triggerEmployee: 'James Rodriguez',
    department: 'Clinical',
    date: '2026-04-28',
    chainLength: 6,
    totalCost: 6100,
    nodes: [
      { id: 'n10', name: 'James Rodriguez', department: 'Clinical', event: 'Mental health day (3rd this month)', timestamp: '5:30 AM', impact: ['12 patient appointments need coverage'], costImpact: 400 },
      { id: 'n11', name: 'Dr. Amy Foster', department: 'Clinical', event: 'Takes 6 extra patients', timestamp: '8:00 AM', impact: ['Rush appointments', 'Documentation incomplete', 'Stays 3hrs late'], costImpact: 900 },
      { id: 'n12', name: 'Dr. Amy Foster', department: 'Clinical', event: 'Charts incomplete → compliance risk', timestamp: '9:00 PM', impact: ['Audit flag', 'Weekend documentation catch-up'], costImpact: 1200 },
      { id: 'n13', name: '6 patients', department: 'Clinical', event: 'Rescheduled to next week', timestamp: '8:00 AM', impact: ['Revenue loss', 'Patient satisfaction drop'], costImpact: 1800 },
      { id: 'n14', name: 'Front Desk Staff', department: 'Operations', event: 'Handles 6 reschedule calls + complaints', timestamp: '8:30 AM', impact: ['Regular duties delayed', 'Stressed interactions'], costImpact: 300 },
      { id: 'n15', name: 'Dr. Amy Foster', department: 'Clinical', event: 'Considers resignation (burnout)', timestamp: 'End of week', impact: ['Potential turnover cost $85K', 'Morale impact'], costImpact: 1500 },
    ]
  }
];

export const ViciousCycleMapper = () => {
  const navigate = useNavigate();
  const [selectedCascade, setSelectedCascade] = useState<CascadeChain>(SAMPLE_CASCADES[0]);
  const [animateChain, setAnimateChain] = useState(true);

  const totalMonthlyCascadeCost = SAMPLE_CASCADES.reduce((acc, c) => acc + c.totalCost, 0);
  const avgChainLength = Math.round(SAMPLE_CASCADES.reduce((acc, c) => acc + c.chainLength, 0) / SAMPLE_CASCADES.length);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-rose-50/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hr/assessment')} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <RefreshCcw className="w-6 h-6 text-rose-600" />
                </div>
                The Vicious Cycle Mapper
              </h1>
              <p className="text-gray-500 mt-1">Visualize how one absence creates cascading burnout across teams</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCcw className="w-4 h-4 text-rose-500" />
              <p className="text-xs font-bold text-gray-500 uppercase">Cascades This Month</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{SAMPLE_CASCADES.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              <p className="text-xs font-bold text-gray-500 uppercase">Total Cascade Cost</p>
            </div>
            <p className="text-3xl font-black text-red-600">${(totalMonthlyCascadeCost / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-bold text-gray-500 uppercase">Avg Chain Length</p>
            </div>
            <p className="text-3xl font-black text-purple-600">{avgChainLength} people</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-gray-500 uppercase">Cascade Multiplier</p>
            </div>
            <p className="text-3xl font-black text-amber-600">3.2x</p>
          </div>
        </div>

        {/* Cascade Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {SAMPLE_CASCADES.map(cascade => (
              <button
                key={cascade.id}
                onClick={() => { setSelectedCascade(cascade); setAnimateChain(true); }}
                className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left ${
                  selectedCascade.id === cascade.id
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-100'
                    : 'bg-gray-50 border-gray-200 hover:border-rose-200'
                }`}
              >
                <p className="text-sm font-bold text-gray-900">{cascade.triggerEmployee}</p>
                <p className="text-xs text-gray-500">{cascade.triggerEvent} • {cascade.date}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                    {cascade.chainLength} affected
                  </span>
                  <span className="text-[10px] font-bold text-gray-600">
                    ${cascade.totalCost.toLocaleString()} cost
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cascade Visualization */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-rose-600" />
              Cascade Chain: {selectedCascade.triggerEmployee} → {selectedCascade.chainLength} downstream events
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-600">Total Cost: ${selectedCascade.totalCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Chain Nodes */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 via-amber-300 to-red-300" />

            <div className="space-y-4">
              {selectedCascade.nodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={animateChain ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: animateChain ? i * 0.3 : 0, duration: 0.4 }}
                  onAnimationComplete={() => { if (i === selectedCascade.nodes.length - 1) setAnimateChain(false); }}
                  className="relative pl-20"
                >
                  {/* Node Dot */}
                  <div className={`absolute left-6 top-4 w-5 h-5 rounded-full border-2 border-white shadow-md z-10 ${
                    i === 0 ? 'bg-rose-500' : i === selectedCascade.nodes.length - 1 ? 'bg-red-600' : 'bg-amber-500'
                  }`} />

                  {/* Arrow */}
                  {i < selectedCascade.nodes.length - 1 && (
                    <div className="absolute left-[30px] top-12 text-gray-300">
                      <ArrowRight className="w-3 h-3 rotate-90" />
                    </div>
                  )}

                  {/* Card */}
                  <div className={`p-4 rounded-xl border ${
                    i === 0 ? 'bg-rose-50 border-rose-200' :
                    i === selectedCascade.nodes.length - 1 ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-sm text-gray-900">{node.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({node.department})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{node.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2">{node.event}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {node.impact.map((imp, j) => (
                          <span key={j} className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                            {imp}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        +${node.costImpact}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Breaking the Cycle */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Recommendations: Breaking This Cycle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Implement fair rotation coverage system — no single person covers more than 2x/month',
              'Mandatory 8hr rest period after any double shift before next scheduled work',
              'Cross-train Operations and Admin staff so coverage doesn\'t pull from unrelated departments',
              'Hire 2 float/relief staff for Operations to eliminate forced double shifts',
              'Deploy nutrition & sleep assessment for Operations team (highest cascade score)',
              'Create "cascade alert" system — when 3+ nodes are triggered, auto-escalate to HR',
            ].map((rec, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-white/90">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
