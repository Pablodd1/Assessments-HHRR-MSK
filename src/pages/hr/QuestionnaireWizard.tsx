import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  RefreshCcw,
  Zap,
  Target,
  Apple,
  Building2,
  Heart,
  Send,
  BarChart3,
  Volume2,
  Sparkles,
  Brain
} from 'lucide-react';

// ─────────────────────────────────────────
// Questionnaire Data
// ─────────────────────────────────────────
const QUESTIONNAIRES: Record<string, { title: string; description: string; sections: QuestionSection[] }> = {
  absenteeism: {
    title: 'Absenteeism & Sick Day Analysis',
    description: 'Identify patterns and root causes of employee absences',
    sections: [
      {
        title: 'Frequency & Patterns',
        questions: [
          { id: 'a1', type: 'radio', text: 'How many sick days have you taken in the last 90 days?', options: ['0', '1-2', '3-5', '6-10', 'More than 10'] },
          { id: 'a2', type: 'checkbox', text: 'Which days are you most likely to call in sick? (Select all)', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends/Holidays'] },
          { id: 'a3', type: 'radio', text: 'Do your absences tend to cluster around specific events?', options: ['Before holidays', 'After weekends', 'End of month', 'No pattern', 'Around pay day'] },
          { id: 'a4', type: 'scale', text: 'How often do you feel too unwell to work but come in anyway? (Presenteeism)', min: 1, max: 10 },
        ]
      },
      {
        title: 'Root Causes',
        questions: [
          { id: 'a5', type: 'checkbox', text: 'Primary reasons for recent absences (Select all that apply)', options: ['Physical illness', 'Mental health day', 'Family obligations', 'Burnout/exhaustion', 'Lack of motivation', 'Workplace conflict', 'Medical appointments', 'Childcare issues', 'Transportation problems'] },
          { id: 'a6', type: 'radio', text: 'How would you rate your overall physical health?', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'] },
          { id: 'a7', type: 'radio', text: 'How many hours of sleep do you typically get?', options: ['Less than 5', '5-6 hours', '6-7 hours', '7-8 hours', 'More than 8'] },
          { id: 'a8', type: 'scale', text: 'Rate your stress level on a typical work day', min: 1, max: 10 },
        ]
      },
      {
        title: 'Team Impact',
        questions: [
          { id: 'a9', type: 'radio', text: 'When you are absent, who typically covers your responsibilities?', options: ['Specific colleague', 'Team distributes', 'Manager covers', 'Work waits until return', 'Overtime hired'] },
          { id: 'a10', type: 'scale', text: 'How guilty do you feel when calling in sick?', min: 1, max: 10 },
          { id: 'a11', type: 'radio', text: 'Do you feel supported when returning from sick leave?', options: ['Very supported', 'Somewhat supported', 'Neutral', 'Somewhat unsupported', 'Very unsupported'] },
          { id: 'a12', type: 'scale', text: 'How satisfied are you with return-to-work processes?', min: 1, max: 10 },
        ]
      },
      {
        title: 'Prevention & Support',
        questions: [
          { id: 'a13', type: 'checkbox', text: 'What would help you take fewer sick days? (Select all)', options: ['Better work-life balance', 'Flexible scheduling', 'Remote work options', 'On-site health services', 'Mental health support', 'Better nutrition options', 'Exercise facilities', 'Reduced workload'] },
          { id: 'a14', type: 'radio', text: 'Would you use a wellness program if offered?', options: ['Definitely', 'Probably', 'Maybe', 'Probably not', 'Definitely not'] },
          { id: 'a15', type: 'text', text: 'Is there anything else contributing to your absences that you would like to share? (Confidential)' },
        ]
      }
    ]
  },
  lateness: {
    title: 'Lateness & Punctuality Assessment',
    description: 'Understand the root causes of tardiness and its impact',
    sections: [
      {
        title: 'Frequency & Duration',
        questions: [
          { id: 'l1', type: 'radio', text: 'How often are you late to work in a typical week?', options: ['Never', '1 time', '2-3 times', '4-5 times', 'Every day'] },
          { id: 'l2', type: 'radio', text: 'When you are late, by how many minutes on average?', options: ['1-5 min', '5-10 min', '10-20 min', '20-30 min', 'More than 30 min'] },
          { id: 'l3', type: 'radio', text: 'Which shift are you most likely to be late for?', options: ['Morning (6-10am)', 'Mid-day (10am-2pm)', 'Afternoon (2-6pm)', 'Evening (6-10pm)', 'Night shift'] },
        ]
      },
      {
        title: 'Root Causes',
        questions: [
          { id: 'l4', type: 'checkbox', text: 'Primary reasons for lateness (Select all)', options: ['Commute/traffic', 'Childcare/school drop-off', 'Oversleeping', 'Poor time management', 'Lack of motivation', 'Second job', 'Health issues', 'Public transport delays', 'Caring for family member'] },
          { id: 'l5', type: 'radio', text: 'How far is your commute?', options: ['Under 15 min', '15-30 min', '30-60 min', '1-2 hours', 'Over 2 hours'] },
          { id: 'l6', type: 'scale', text: 'How motivated do you feel to arrive on time?', min: 1, max: 10 },
          { id: 'l7', type: 'radio', text: 'Would flexible start times help?', options: ['Definitely yes', 'Probably yes', 'Maybe', 'Probably not', 'No'] },
        ]
      },
      {
        title: 'Impact & Solutions',
        questions: [
          { id: 'l8', type: 'scale', text: 'How much does your lateness affect your team?', min: 1, max: 10 },
          { id: 'l9', type: 'checkbox', text: 'What accommodations would improve punctuality? (Select all)', options: ['Flex time window', 'Remote work option', 'Later start time', 'Compressed work week', 'Childcare support', 'Transport subsidy', 'Shift swap system'] },
          { id: 'l10', type: 'radio', text: 'Are you aware of the company punctuality policy?', options: ['Yes, fully', 'Somewhat', 'Vaguely', 'No'] },
        ]
      }
    ]
  },
  'vicious-cycle': {
    title: 'The Vicious Cycle Mapper',
    description: 'Map cascading effects of absences on team burnout',
    sections: [
      {
        title: 'Coverage & Double Shifts',
        questions: [
          { id: 'v1', type: 'radio', text: 'How often do you cover for absent colleagues per month?', options: ['Never', '1-2 times', '3-5 times', '6-10 times', 'More than 10'] },
          { id: 'v2', type: 'radio', text: 'How often do you work double shifts due to others\' absences?', options: ['Never', 'Rarely (1x/month)', 'Sometimes (2-3x/month)', 'Often (weekly)', 'Very often (multiple/week)'] },
          { id: 'v3', type: 'scale', text: 'How exhausted do you feel after covering for someone?', min: 1, max: 10 },
          { id: 'v4', type: 'radio', text: 'After covering, how likely are you to call in sick the next day?', options: ['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely'] },
        ]
      },
      {
        title: 'Cascade Effects',
        questions: [
          { id: 'v5', type: 'scale', text: 'Rate the fairness of workload distribution when someone is absent', min: 1, max: 10 },
          { id: 'v6', type: 'radio', text: 'Do the same people always end up covering?', options: ['Yes, always the same few', 'Mostly the same', 'It rotates somewhat', 'It rotates fairly', 'Never noticed'] },
          { id: 'v7', type: 'checkbox', text: 'What happens when you cover? (Select all)', options: ['I get overtime pay', 'I get time off later', 'I get nothing extra', 'I make more errors due to fatigue', 'My own work falls behind', 'I feel resentful', 'I get recognized by management'] },
          { id: 'v8', type: 'scale', text: 'How close are you to your own breaking point?', min: 1, max: 10 },
        ]
      },
      {
        title: 'Breaking the Cycle',
        questions: [
          { id: 'v9', type: 'checkbox', text: 'What would break this cycle? (Select all)', options: ['More staff hired', 'Cross-training', 'Fair rotation system', 'Better compensation for coverage', 'Wellness programs to reduce absences', 'Management acknowledgment', 'Workload reduction', 'Mandatory rest after double shift'] },
          { id: 'v10', type: 'radio', text: 'If nothing changes, how long before you consider leaving?', options: ['Already looking', 'Within 3 months', 'Within 6 months', 'Within a year', 'Not considering leaving'] },
        ]
      }
    ]
  },
  productivity: {
    title: 'Productivity & Engagement Assessment',
    description: 'Measure energy, focus, task completion, and collaboration',
    sections: [
      {
        title: 'Energy & Focus',
        questions: [
          { id: 'p1', type: 'radio', text: 'When is your peak productivity time?', options: ['Early morning (6-9am)', 'Mid-morning (9-12pm)', 'Early afternoon (12-3pm)', 'Late afternoon (3-6pm)', 'Evening (after 6pm)'] },
          { id: 'p2', type: 'scale', text: 'Rate your typical energy level at work', min: 1, max: 10 },
          { id: 'p3', type: 'radio', text: 'Do you experience an afternoon energy crash?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Every day'] },
          { id: 'p4', type: 'scale', text: 'How well can you focus for extended periods?', min: 1, max: 10 },
          { id: 'p5', type: 'radio', text: 'How often are you interrupted during focused work?', options: ['Constantly', 'Very often', 'Sometimes', 'Rarely', 'Almost never'] },
        ]
      },
      {
        title: 'Task Completion',
        questions: [
          { id: 'p6', type: 'radio', text: 'What percentage of your daily tasks do you typically complete?', options: ['Less than 50%', '50-70%', '70-85%', '85-95%', '95-100%'] },
          { id: 'p7', type: 'checkbox', text: 'What blocks your productivity? (Select all)', options: ['Meetings', 'Email/messages', 'Unclear priorities', 'Lack of resources', 'Poor tools/systems', 'Noise/distractions', 'Fatigue', 'Lack of motivation', 'Micromanagement'] },
          { id: 'p8', type: 'scale', text: 'How clear are your daily priorities?', min: 1, max: 10 },
        ]
      },
      {
        title: 'Collaboration & Initiative',
        questions: [
          { id: 'p9', type: 'scale', text: 'How effective is collaboration with your team?', min: 1, max: 10 },
          { id: 'p10', type: 'radio', text: 'How often do you proactively suggest improvements?', options: ['Weekly', 'Monthly', 'Quarterly', 'Rarely', 'Never'] },
          { id: 'p11', type: 'scale', text: 'How engaged do you feel with your current role?', min: 1, max: 10 },
          { id: 'p12', type: 'checkbox', text: 'What would boost your productivity? (Select all)', options: ['Better tools', 'Fewer meetings', 'Clear goals', 'Autonomy', 'Training', 'Quiet workspace', 'Flexible hours', 'Recognition', 'Better management'] },
        ]
      }
    ]
  },
  incentives: {
    title: 'Incentive & Motivation Profiling',
    description: 'Discover what truly drives each employee',
    sections: [
      {
        title: 'Recognition Preferences',
        questions: [
          { id: 'i1', type: 'checkbox', text: 'What type of recognition motivates you most? (Select top 3)', options: ['Public praise in meetings', 'Private thank-you from manager', 'Bonus/monetary reward', 'Extra time off', 'Promotion opportunity', 'Learning/training budget', 'Written commendation', 'Team celebration'] },
          { id: 'i2', type: 'radio', text: 'How often do you feel recognized for your work?', options: ['Too often', 'Frequently', 'Sometimes', 'Rarely', 'Never'] },
          { id: 'i3', type: 'scale', text: 'How important is public recognition to you?', min: 1, max: 10 },
        ]
      },
      {
        title: 'Growth & Development',
        questions: [
          { id: 'i4', type: 'radio', text: 'Where do you see yourself in 2 years?', options: ['Same role, mastering it', 'Promoted to next level', 'Different department', 'Leadership role', 'Starting own business', 'Unsure'] },
          { id: 'i5', type: 'checkbox', text: 'What development opportunities interest you? (Select all)', options: ['Technical skills training', 'Leadership development', 'Certifications', 'Mentorship', 'Cross-department rotation', 'Conference attendance', 'Online courses', 'Degree sponsorship'] },
          { id: 'i6', type: 'scale', text: 'How satisfied are you with growth opportunities here?', min: 1, max: 10 },
        ]
      },
      {
        title: 'Work-Life Balance',
        questions: [
          { id: 'i7', type: 'radio', text: 'What matters most for your work-life balance?', options: ['Flexible hours', 'Remote work', 'No overtime', 'Generous PTO', 'Predictable schedule', '4-day work week'] },
          { id: 'i8', type: 'scale', text: 'Rate your current work-life balance', min: 1, max: 10 },
          { id: 'i9', type: 'checkbox', text: 'What benefits would you value most? (Select top 3)', options: ['Health insurance upgrade', 'Gym membership', 'Mental health days', 'Childcare support', 'Pet-friendly office', 'Free meals', 'Transport allowance', 'Stock options', 'Sabbatical option'] },
        ]
      }
    ]
  },
  nutrition: {
    title: 'Nutrition & Supplementation Assessment',
    description: 'Assess energy, sleep, hydration, and cognitive performance',
    sections: [
      {
        title: 'Energy Patterns',
        questions: [
          { id: 'n1', type: 'radio', text: 'How would you describe your morning energy?', options: ['Wide awake', 'Slow start but fine', 'Need coffee to function', 'Struggle until 10am', 'Exhausted all morning'] },
          { id: 'n2', type: 'radio', text: 'Do you experience an afternoon energy crash?', options: ['Never', '1-2 days/week', '3-4 days/week', 'Almost daily', 'Every single day'] },
          { id: 'n3', type: 'scale', text: 'Rate your sustained energy throughout the day', min: 1, max: 10 },
          { id: 'n4', type: 'radio', text: 'How many caffeinated drinks per day?', options: ['None', '1-2', '3-4', '5-6', 'More than 6'] },
        ]
      },
      {
        title: 'Sleep & Recovery',
        questions: [
          { id: 'n5', type: 'radio', text: 'Average hours of sleep per night?', options: ['Less than 5', '5-6', '6-7', '7-8', 'More than 8'] },
          { id: 'n6', type: 'scale', text: 'Rate your sleep quality', min: 1, max: 10 },
          { id: 'n7', type: 'checkbox', text: 'Sleep issues you experience (Select all)', options: ['Difficulty falling asleep', 'Waking during night', 'Waking too early', 'Not feeling rested', 'Screen use before bed', 'Stress-related insomnia', 'Pain disrupting sleep', 'Sleep apnea symptoms'] },
          { id: 'n8', type: 'radio', text: 'Do you use sleep aids?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Every night'] },
        ]
      },
      {
        title: 'Nutrition & Hydration',
        questions: [
          { id: 'n9', type: 'radio', text: 'How many meals do you eat per day?', options: ['1 meal', '2 meals', '3 meals', '4-5 small meals', 'Irregular/grazing'] },
          { id: 'n10', type: 'radio', text: 'How much water do you drink daily?', options: ['Less than 2 cups', '2-4 cups', '4-6 cups', '6-8 cups', 'More than 8 cups'] },
          { id: 'n11', type: 'checkbox', text: 'Current supplements (Select all)', options: ['Multivitamin', 'Vitamin D', 'Omega-3', 'Magnesium', 'B-Complex', 'Iron', 'Probiotics', 'Protein powder', 'None'] },
          { id: 'n12', type: 'radio', text: 'How would you rate your diet quality?', options: ['Excellent', 'Good', 'Average', 'Poor', 'Very poor'] },
        ]
      },
      {
        title: 'Cognitive Performance',
        questions: [
          { id: 'n13', type: 'scale', text: 'Rate your mental clarity during work', min: 1, max: 10 },
          { id: 'n14', type: 'radio', text: 'Do you experience brain fog?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'] },
          { id: 'n15', type: 'checkbox', text: 'Cognitive issues you notice (Select all)', options: ['Difficulty concentrating', 'Memory lapses', 'Slow decision-making', 'Difficulty learning new things', 'Mental fatigue', 'Mood swings', 'Irritability', 'None'] },
          { id: 'n16', type: 'radio', text: 'Would you be interested in nutrition counseling?', options: ['Very interested', 'Somewhat interested', 'Neutral', 'Not very interested', 'Not at all'] },
        ]
      }
    ]
  },
  environment: {
    title: 'Workplace Environment Assessment',
    description: 'Evaluate physical workspace comfort and ergonomics',
    sections: [
      {
        title: 'Workstation Comfort',
        questions: [
          { id: 'e1', type: 'scale', text: 'Rate your workstation comfort (1=terrible, 10=perfect)', min: 1, max: 10 },
          { id: 'e2', type: 'checkbox', text: 'Workstation issues (Select all)', options: ['Chair uncomfortable', 'Desk too high/low', 'Monitor position poor', 'Keyboard/mouse issues', 'Inadequate lighting', 'Temperature issues', 'No standing option', 'Cramped space'] },
          { id: 'e3', type: 'radio', text: 'How is the noise level?', options: ['Too quiet', 'Just right', 'Slightly noisy', 'Very noisy', 'Unbearable'] },
          { id: 'e4', type: 'scale', text: 'Rate the air quality/ventilation', min: 1, max: 10 },
        ]
      },
      {
        title: 'Breaks & Movement',
        questions: [
          { id: 'e5', type: 'radio', text: 'How often do you take breaks?', options: ['Every 30 min', 'Every hour', 'Every 2 hours', 'Once in morning/afternoon', 'Rarely/never'] },
          { id: 'e6', type: 'radio', text: 'Do you have a designated break area?', options: ['Yes, excellent', 'Yes, adequate', 'Yes, poor quality', 'No designated area', 'I eat at my desk'] },
          { id: 'e7', type: 'scale', text: 'How much physical movement do you get during work?', min: 1, max: 10 },
          { id: 'e8', type: 'checkbox', text: 'What would improve your workspace? (Select all)', options: ['Standing desk', 'Better chair', 'Natural lighting', 'Plants/greenery', 'Quiet zones', 'Better ventilation', 'Gym/exercise area', 'Outdoor break space'] },
        ]
      }
    ]
  },
  'mental-health': {
    title: 'Mental Health & Stress Screening',
    description: 'Confidential assessment of workplace stress and wellbeing',
    sections: [
      {
        title: 'Stress Levels',
        questions: [
          { id: 'm1', type: 'scale', text: 'Rate your current overall stress level', min: 1, max: 10 },
          { id: 'm2', type: 'checkbox', text: 'Main sources of work stress (Select all)', options: ['Workload volume', 'Deadlines', 'Interpersonal conflict', 'Lack of control', 'Job insecurity', 'Poor management', 'Work-life imbalance', 'Unclear expectations', 'Insufficient resources'] },
          { id: 'm3', type: 'radio', text: 'How often do you feel overwhelmed?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'] },
          { id: 'm4', type: 'radio', text: 'Can you disconnect from work outside hours?', options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'] },
        ]
      },
      {
        title: 'Burnout Indicators',
        questions: [
          { id: 'm5', type: 'scale', text: 'How emotionally exhausted do you feel from work?', min: 1, max: 10 },
          { id: 'm6', type: 'scale', text: 'How detached/cynical do you feel about your job?', min: 1, max: 10 },
          { id: 'm7', type: 'scale', text: 'How effective/accomplished do you feel at work?', min: 1, max: 10 },
          { id: 'm8', type: 'radio', text: 'Have you considered seeking mental health support?', options: ['Already receiving support', 'Actively looking', 'Considering it', 'Not at this time', 'Would never'] },
        ]
      },
      {
        title: 'Support & Coping',
        questions: [
          { id: 'm9', type: 'checkbox', text: 'How do you currently cope with stress? (Select all)', options: ['Exercise', 'Meditation/mindfulness', 'Social support', 'Hobbies', 'Alcohol/substances', 'Avoidance', 'Therapy/counseling', 'Nothing specific'] },
          { id: 'm10', type: 'scale', text: 'How supported do you feel by your direct manager?', min: 1, max: 10 },
          { id: 'm11', type: 'checkbox', text: 'What mental health resources would you use? (Select all)', options: ['Confidential counseling', 'Stress management workshops', 'Meditation app subscription', 'Mental health days', 'Peer support groups', 'Manager training', 'Flexible scheduling', 'Reduced workload option'] },
          { id: 'm12', type: 'radio', text: 'Do you feel safe discussing mental health at work?', options: ['Completely safe', 'Mostly safe', 'Somewhat safe', 'Not very safe', 'Not safe at all'] },
        ]
      }
    ]
  }
};

interface Question {
  id: string;
  type: 'radio' | 'checkbox' | 'scale' | 'text';
  text: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface QuestionSection {
  title: string;
  questions: Question[];
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export const QuestionnaireWizard = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const questionnaire = QUESTIONNAIRES[type || ''];
  
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!questionnaire) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Questionnaire Not Found</h2>
          <p className="text-gray-500 mb-4">The requested assessment type does not exist.</p>
          <button onClick={() => navigate('/hr/assessment')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const sections = questionnaire.sections;
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (current.includes(option)) {
        return { ...prev, [questionId]: current.filter((o: string) => o !== option) };
      }
      return { ...prev, [questionId]: [...current, option] };
    });
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsComplete(true);
    }, 2500);
  };

  if (isComplete) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-500 mb-6">Your responses have been analyzed by our AI engine.</p>
            
            {/* Results Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 text-left mb-6">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Analysis Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Risk Level</span>
                  <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Medium</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Key Patterns Detected</span>
                  <span className="text-sm font-bold text-indigo-600">3 patterns</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Recommended Interventions</span>
                  <span className="text-sm font-bold text-emerald-600">5 actions</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/hr/assessment')}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Hub
              </button>
              <button
                onClick={() => navigate('/hr/cost-calculator')}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                View Cost Impact →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Responses...</h2>
          <p className="text-gray-500">AI is detecting patterns and generating recommendations</p>
        </motion.div>
      </div>
    );
  }

  const currentQuestions = sections[currentSection].questions;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/hr/assessment')}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Assessments
            </button>
            <span className="text-sm font-bold text-indigo-600">{progress}% Complete</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{questionnaire.title}</h1>
          <p className="text-gray-500 text-sm mb-4">{questionnaire.description}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Section Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  index === currentSection
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : index < currentSection
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {index < currentSection && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {currentQuestions.map((question, qIndex) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p className="font-semibold text-gray-900 mb-4 flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">
                    {qIndex + 1}
                  </span>
                  {question.text}
                </p>

                {/* Radio Options */}
                {question.type === 'radio' && question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                    {question.options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, option)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                          answers[question.id] === option
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold ring-2 ring-indigo-200'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {answers[question.id] === option ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Checkbox Options */}
                {question.type === 'checkbox' && question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                    {question.options.map(option => {
                      const isChecked = (answers[question.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleCheckboxToggle(question.id, option)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                            isChecked
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold ring-2 ring-indigo-200'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 ${
                            isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Scale */}
                {question.type === 'scale' && (
                  <div className="ml-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Low</span>
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: (question.max || 10) - (question.min || 1) + 1 }, (_, i) => i + (question.min || 1)).map(val => (
                          <button
                            key={val}
                            onClick={() => handleAnswer(question.id, val)}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                              answers[question.id] === val
                                ? val <= 3 ? 'bg-emerald-500 text-white shadow-sm' 
                                  : val <= 6 ? 'bg-amber-500 text-white shadow-sm' 
                                  : 'bg-red-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">High</span>
                    </div>
                  </div>
                )}

                {/* Text */}
                {question.type === 'text' && (
                  <div className="ml-10">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder="Type your response here (confidential)..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none h-24 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none text-sm"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between sticky bottom-4">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {sections.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSection ? 'bg-indigo-600 w-6' : i < currentSection ? 'bg-emerald-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {currentSection < sections.length - 1 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              Next Section
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
