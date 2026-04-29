export interface Task {
  id: string;
  patientId?: string;
  patientName?: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interest: string;
  contactMethod: string;
  bestTime: string;
  source: string;
  status: 'New' | 'Analyzed' | 'Contacted' | 'Scheduled';
  intent: 'High' | 'Medium' | 'Low';
  leadScore: number;
  aiSummary: string;
  suggestedFollowUp: string;
  communications: {
    emails: { type: string; day: number; subject: string; body: string }[];
    sms: { type: string; body: string }[];
  };
  timeline: { date: string; event: string }[];
  appointmentClicked: boolean;
}

export const mockTasks: Task[] = [
  {
    id: 't1',
    patientId: '1',
    patientName: 'John Smith',
    title: 'Review AI Analysis',
    description: 'Check the AI summary and suggested follow-up for John.',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    completed: false
  },
  {
    id: 't2',
    patientId: '2',
    patientName: 'Maria Lopez',
    title: 'Send Welcome Email',
    description: 'Manually trigger the welcome email sequence.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    completed: false
  },
  {
    id: 't3',
    patientId: '3',
    patientName: 'David Chen',
    title: 'Follow up on Consultation',
    description: 'Call David to confirm his upcoming appointment.',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    completed: true
  }
];

export interface EmployeeRiskProfile {
  id: string;
  name: string;
  department: string;
  position: string;
  averageLateness: number; // minutes per week
  sickDaysLastQuarter: number;
  performanceScore: number; // 0-100
  motivationLevel: number; // 0-100
  turnoverRisk: 'Low' | 'Medium' | 'High';
  lastAssessmentDate: string;
  notes: string;
  voiceIntake?: string;
  surveyResults?: {
    reasonForLate?: string;
    motivationDrivers?: string[];
    burnoutSymptoms?: string[];
  };
}

export const mockEmployeeRisks: EmployeeRiskProfile[] = [
  {
    id: 'e1',
    name: 'Robert Wilson',
    department: 'Hospitality',
    position: 'Front Desk Lead',
    averageLateness: 15,
    sickDaysLastQuarter: 8,
    performanceScore: 65,
    motivationLevel: 45,
    turnoverRisk: 'High',
    lastAssessmentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'High risk of burnout due to frequent double shifts. Motivation significantly dropped after the departmental restructuring.',
    voiceIntake: 'I feel like I am doing the work of three people and the schedule is never consistent. It makes it hard to plan my life.',
    surveyResults: {
      reasonForLate: 'Public transport issues and sleep deprivation.',
      motivationDrivers: ['Recognition', 'Better Pay'],
      burnoutSymptoms: ['Exhaustion', 'Irritability']
    }
  },
  {
    id: 'e2',
    name: 'Sarah Jenkins',
    department: 'Housekeeping',
    position: 'Area Supervisor',
    averageLateness: 2,
    sickDaysLastQuarter: 1,
    performanceScore: 92,
    motivationLevel: 88,
    turnoverRisk: 'Low',
    lastAssessmentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Exceptional performance. Strong candidate for further leadership training.',
    surveyResults: {
      motivationDrivers: ['Career Growth', 'Team Success'],
      burnoutSymptoms: []
    }
  },
  {
    id: 'e3',
    name: 'Michael Chang',
    department: 'Food & Beverage',
    position: 'Server',
    averageLateness: 45,
    sickDaysLastQuarter: 4,
    performanceScore: 55,
    motivationLevel: 30,
    turnoverRisk: 'High',
    lastAssessmentDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    notes: 'Chronic lateness. Expressed desire for a different career path. Motivation at all-time low.',
    voiceIntake: 'To be honest, I am just showing up for the paycheck. I dont feel connected to the team anymore.',
    surveyResults: {
      reasonForLate: 'Oversleeping and lack of motivation.',
      motivationDrivers: ['None'],
      burnoutSymptoms: ['Cynicism', 'Lack of accomplishment']
    }
  }
];

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '555-0101',
    interest: 'Recovery and Performance',
    contactMethod: 'Both',
    bestTime: 'Morning',
    source: 'Event Flyer QR',
    status: 'Contacted',
    intent: 'High',
    leadScore: 8,
    aiSummary: 'Patient is interested in recovery support, energy, and better routines. No diagnosis inferred. Best next step is clinician-led consultation.',
    suggestedFollowUp: 'Educational Email Sequence + SMS + Scheduling Prompt',
    communications: {
      emails: [
        { type: 'Welcome Email', day: 1, subject: 'Welcome to Your Wellness Journey, John', body: '<p>Hi John,</p><p>Thank you for your interest in Recovery and Performance. We are excited to support your lifestyle goals.</p><p>Our clinician-led approach focuses on individualized strategies to help you optimize your potential.</p><p>Ready to take the next step? Schedule a brief consultation to discuss your specific needs.</p>' },
        { type: 'What To Expect', day: 3, subject: 'What to Expect from Our Clinic', body: '<p>Hi John,</p><p>When you visit our clinic, our focus is entirely on your individualized wellness journey. We use data-driven insights to support your goals.</p><p>Schedule a consultation today to learn more.</p>' },
        { type: 'Wellness Education', day: 7, subject: 'Educational Insights: Recovery and Performance', body: '<p>Hi John,</p><p>Did you know that optimizing your daily routines can significantly impact your overall vitality? Small changes can lead to noticeable improvements in how you feel.</p><p>Let\'s discuss how this applies to you. Schedule an appointment below.</p>' },
        { type: 'FAQ / Objections', day: 14, subject: 'Common Questions Answered', body: '<p>Hi John,</p><p>Many people wonder if our approach is right for them. Our programs are designed to be flexible and supportive of your unique lifestyle.</p><p>Have more questions? We\'d love to chat. Schedule a consultation.</p>' },
        { type: 'Invitation To Schedule', day: 21, subject: 'Your Personalized Consultation Awaits', body: '<p>Hi John,</p><p>You\'ve learned a lot about our approach over the past few weeks. Now it\'s time to take action.</p><p>Schedule your clinician-led consultation today and let\'s build your individualized plan.</p>' }
      ],
      sms: [
        { type: 'Welcome SMS', body: 'Hi John, thanks for connecting with our clinic. Here is your scheduling link: clinic.demo/schedule. Reply STOP to opt out.' },
        { type: 'Reminder SMS', body: 'Hi John, just a reminder that your personalized wellness plan is waiting. Schedule your consultation: clinic.demo/schedule. Reply STOP to opt out.' },
        { type: 'Follow-up SMS', body: 'Hi John, we\'d love to help you reach your Recovery and Performance goals. Let\'s chat: clinic.demo/schedule. Reply STOP to opt out.' }
      ]
    },
    timeline: [
      { date: new Date(Date.now() - 86400000 * 2).toISOString(), event: 'Scanned Event Flyer QR' },
      { date: new Date(Date.now() - 86400000 * 2 + 300000).toISOString(), event: 'Submitted Interest Form' },
      { date: new Date(Date.now() - 86400000 * 2 + 360000).toISOString(), event: 'AI Analysis Completed' },
      { date: new Date(Date.now() - 86400000 * 1).toISOString(), event: 'Welcome Email Sent' },
      { date: new Date(Date.now() - 86400000 * 1).toISOString(), event: 'Welcome SMS Sent' }
    ],
    appointmentClicked: false
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Lopez',
    email: 'maria.l@example.com',
    phone: '555-0102',
    interest: 'Sleep and Stress Support',
    contactMethod: 'Email',
    bestTime: 'Evening',
    source: 'Front Desk QR',
    status: 'Analyzed',
    intent: 'Medium',
    leadScore: 6,
    aiSummary: 'Patient indicates interest in sleep optimization and stress management. Educational content on sleep hygiene recommended. No diagnosis inferred.',
    suggestedFollowUp: 'Educational Email Sequence + Scheduling Prompt',
    communications: {
      emails: [
        { type: 'Welcome Email', day: 1, subject: 'Welcome to Your Wellness Journey, Maria', body: '<p>Hi Maria,</p><p>Thank you for your interest in Sleep and Stress Support. We are excited to support your lifestyle goals.</p><p>Our clinician-led approach focuses on individualized strategies to help you optimize your potential.</p><p>Ready to take the next step? Schedule a brief consultation to discuss your specific needs.</p>' },
        { type: 'What To Expect', day: 3, subject: 'What to Expect from Our Clinic', body: '<p>Hi Maria,</p><p>When you visit our clinic, our focus is entirely on your individualized wellness journey. We use data-driven insights to support your goals.</p><p>Schedule a consultation today to learn more.</p>' },
        { type: 'Wellness Education', day: 7, subject: 'Educational Insights: Sleep and Stress Support', body: '<p>Hi Maria,</p><p>Did you know that optimizing your daily routines can significantly impact your overall vitality? Small changes can lead to noticeable improvements in how you feel.</p><p>Let\'s discuss how this applies to you. Schedule an appointment below.</p>' },
        { type: 'FAQ / Objections', day: 14, subject: 'Common Questions Answered', body: '<p>Hi Maria,</p><p>Many people wonder if our approach is right for them. Our programs are designed to be flexible and supportive of your unique lifestyle.</p><p>Have more questions? We\'d love to chat. Schedule a consultation.</p>' },
        { type: 'Invitation To Schedule', day: 21, subject: 'Your Personalized Consultation Awaits', body: '<p>Hi Maria,</p><p>You\'ve learned a lot about our approach over the past few weeks. Now it\'s time to take action.</p><p>Schedule your clinician-led consultation today and let\'s build your individualized plan.</p>' }
      ],
      sms: []
    },
    timeline: [
      { date: new Date(Date.now() - 3600000 * 5).toISOString(), event: 'Scanned Front Desk QR' },
      { date: new Date(Date.now() - 3600000 * 5 + 300000).toISOString(), event: 'Submitted Interest Form' },
      { date: new Date(Date.now() - 3600000 * 5 + 360000).toISOString(), event: 'AI Analysis Completed' }
    ],
    appointmentClicked: false
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.c@example.com',
    phone: '555-0103',
    interest: 'Longevity and Wellness',
    contactMethod: 'SMS',
    bestTime: 'Afternoon',
    source: 'Referral Card QR',
    status: 'Scheduled',
    intent: 'Low',
    leadScore: 4,
    aiSummary: 'Patient exploring general longevity and wellness options. Low immediate intent. Nurture sequence recommended. No diagnosis inferred.',
    suggestedFollowUp: 'Long-term Nurture Sequence',
    communications: {
      emails: [],
      sms: [
        { type: 'Welcome SMS', body: 'Hi David, thanks for connecting with our clinic. Here is your scheduling link: clinic.demo/schedule. Reply STOP to opt out.' },
        { type: 'Reminder SMS', body: 'Hi David, just a reminder that your personalized wellness plan is waiting. Schedule your consultation: clinic.demo/schedule. Reply STOP to opt out.' },
        { type: 'Follow-up SMS', body: 'Hi David, we\'d love to help you reach your Longevity and Wellness goals. Let\'s chat: clinic.demo/schedule. Reply STOP to opt out.' }
      ]
    },
    timeline: [
      { date: new Date(Date.now() - 86400000 * 14).toISOString(), event: 'Scanned Referral Card QR' },
      { date: new Date(Date.now() - 86400000 * 14 + 300000).toISOString(), event: 'Submitted Interest Form' },
      { date: new Date(Date.now() - 86400000 * 14 + 360000).toISOString(), event: 'AI Analysis Completed' },
      { date: new Date(Date.now() - 86400000 * 13).toISOString(), event: 'Welcome SMS Sent' },
      { date: new Date(Date.now() - 86400000 * 7).toISOString(), event: 'Reminder SMS Sent' },
      { date: new Date(Date.now() - 3600000 * 2).toISOString(), event: 'Appointment Scheduled' }
    ],
    appointmentClicked: true
  }
];
