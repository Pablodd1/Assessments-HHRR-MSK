# HR Risk Clinical Assessment Platform

A comprehensive **dual-purpose enterprise platform** combining Clinical MSK/Functional Assessment with HR Workforce Analytics. Designed for large companies with established protocols and standards.

---

## Platform Architecture: Two Core Pillars

### PILLAR 1: Clinical Assessment Engine (For Clinicians, Coaches & Doctors)

The clinical side absorbs, understands, and creates proper assessments based on data from 3D motion capture, functional movement screens, and MSK evaluations. It generates treatment plans and training programs with voice explanations.

#### What It Does:
- **Absorbs Raw 3D Assessment Data** — Parses incoming data from third-party motion capture systems (KinetSense, DARI Motion, etc.)
- **Creates Clinical Assessments** — Generates comprehensive evaluations based on movement patterns, ROM, asymmetries
- **Treatment Plan Generation** — AI-powered treatment plans from a Physical Therapist + Medical Doctor perspective
- **Training Program Design** — Functional training programs based on movement pattern deficiencies
- **Voice Transcript Explanations** — Every assessment includes AI-generated voice explanation for the patient, coach, and doctor
- **Coaching Integration** — Actionable insights formatted for strength coaches and personal trainers

#### Clinical Workflow:
```
3D Assessment Data (raw) → Data Parser → Pattern Analysis → AI Clinical Engine
    ↓                                                              ↓
Movement Patterns                                    Treatment Plan (PT/MD)
Asymmetry Detection                                  Training Program (Coach)
ROM Measurements                                     Voice Transcript (All)
Compensation Patterns                                Risk Stratification
Functional Scores                                    Follow-up Protocol
```

#### Clinical Assessment Types:
1. **MSK Screening** — 8-region body map with pain/stiffness/mobility assessment
2. **3D Motion Capture** — Markerless skeleton tracking with ROM analysis
3. **Posture Analysis** — Multi-angle photo analysis with deviation scoring
4. **Functional Movement Screen** — Movement pattern quality assessment
5. **Annual Wellness Review** — Comprehensive yearly evaluation

#### Output for Each Stakeholder:
| Stakeholder | Output Format | Content |
|------------|---------------|---------|
| **Patient** | Voice transcript + visual report | Plain-language explanation of findings, exercises, lifestyle changes |
| **Coach** | Training protocol PDF | Exercise prescription, sets/reps, progressions, contraindications |
| **Doctor/PT** | Clinical report | Medical terminology, differential considerations, referral triggers |

---

### PILLAR 2: HR Workforce Assessment Engine (For HR, Company Owners & Department Heads)

The HR side uses structured questionnaires and creative assessment workflows to identify WHY employees get sick, come late, burn out, and cost the employer money. It quantifies the vicious cycle of absenteeism → double shifts → burnout → more absenteeism.

#### What It Does:
- **Identifies Root Causes** — Why staff calls in sick, arrives late, lacks productivity
- **Quantifies Employer Cost** — Dollar cost of sick days, overtime, double shifts, turnover
- **Breaks the Vicious Cycle** — Maps how one person's absence creates cascading burnout
- **Assesses Incentive Needs** — What motivates each employee (not one-size-fits-all)
- **Nutrition & Supplementation Assessment** — Energy, sleep, cognitive performance factors
- **Department-Level Analysis** — Each department head gets their own assessment interface

#### HR Assessment Questionnaires:

##### 1. Absenteeism & Sick Day Analysis
- Frequency of sick days (last 30/60/90 days)
- Pattern detection (Mondays, Fridays, before/after holidays)
- Self-reported reasons (illness, mental health, family, disengagement)
- Impact on team (who covers, overtime generated)
- Return-to-work satisfaction score

##### 2. Lateness & Punctuality Assessment
- Average minutes late per week
- Root cause identification (commute, childcare, sleep, motivation)
- Correlation with shift type (morning vs. afternoon)
- Impact on team morale and workflow
- Suggested accommodations (flex time, remote options)

##### 3. The Vicious Cycle Mapper
- When Employee A calls sick → Employee B takes double shift
- Employee B becomes fatigued → Makes errors OR calls sick next week
- Ripple effect scoring across departments
- Financial cascade calculation
- Breaking point identification

##### 4. Productivity & Engagement Assessment
- Task completion rates
- Self-reported energy levels throughout the day
- Focus and concentration scoring
- Collaboration effectiveness
- Innovation and initiative metrics

##### 5. Incentive & Motivation Profiling
- What type of recognition matters (public, private, monetary, time-off)
- Career growth aspirations
- Work-life balance priorities
- Team dynamics preferences
- Learning and development interests

##### 6. Nutrition & Supplementation Needs
- Daily energy patterns (morning crash, afternoon slump)
- Sleep quality and duration
- Hydration habits
- Meal timing and quality
- Supplement knowledge and current usage
- Cognitive performance self-assessment

##### 7. Workplace Environment & Ergonomics
- Workstation comfort rating
- Noise and distraction levels
- Temperature and lighting satisfaction
- Break frequency and quality
- Physical activity during work hours

##### 8. Mental Health & Stress Screening
- Perceived stress scale
- Burnout indicators (Maslach dimensions)
- Work-life boundary assessment
- Social support at work
- Coping mechanism inventory

#### HR Workflow:
```
Department Head Login → Select Assessment Type → Deploy to Team
    ↓                                                    ↓
View Results Dashboard                          Employees Complete
Cost Impact Report                              Anonymous Responses
Intervention Recommendations                    Pattern Detection
Voice AI Summary                                Risk Flagging
```

#### Cost Calculator Outputs:
| Metric | Calculation |
|--------|-------------|
| **Cost per sick day** | (Annual salary / 260) × 1.5 (coverage cost) |
| **Double shift premium** | Overtime rate × hours × frequency |
| **Turnover cost** | 50-200% of annual salary (recruitment + training + lost productivity) |
| **Presenteeism cost** | Salary × productivity loss % × days affected |
| **Cascade cost** | Sum of downstream sick days triggered by original absence |

---

## Raw Data Analysis Engine

### Third-Party Data Integration
The platform analyzes raw data coming from external sources:

1. **Clinical Data Sources:**
   - 3D motion capture exports (CSV, JSON, XML)
   - Wearable device data (Apple Health, Google Fit, Garmin)
   - EMR/EHR extracts
   - Lab results
   - Imaging reports

2. **HR Data Sources:**
   - HRIS exports (Workday, BambooHR, ADP)
   - Time & attendance systems
   - Performance review data
   - Employee surveys (SurveyMonkey, Culture Amp)
   - Benefits utilization data

3. **Company Analytics Sources:**
   - Workers compensation claims
   - OSHA incident logs
   - Insurance claims data
   - Productivity metrics (Jira, Asana, Salesforce)
   - Facility access logs

### Data Processing Pipeline:
```
Raw Data Upload (CSV/JSON/XML/PDF) → Format Detection → Schema Mapping
    ↓
Data Validation → Anomaly Detection → Statistical Analysis
    ↓
Pattern Recognition → Correlation Engine → AI Insights
    ↓
Visual Dashboard → Actionable Recommendations → Voice Summary
```

---

## User Interface Design Philosophy

### For HR Department Heads (Enterprise-Grade UX):
- **Checkbox-driven questionnaires** — No typing required, tap/click to complete
- **Visual progress indicators** — Step-by-step wizard with percentage complete
- **Traffic light system** — Green/Yellow/Red for instant risk comprehension
- **Graphical dashboards** — Charts, gauges, and heat maps (not spreadsheets)
- **One-click deployment** — Send assessments to entire departments instantly
- **Anonymous mode** — Employees feel safe to answer honestly
- **Mobile-first** — Works on any device without training

### For Clinical Professionals:
- **Data visualization** — 3D body models, movement graphs, trend lines
- **AI-generated narratives** — No manual report writing
- **Voice playback** — Listen to AI explanations while reviewing
- **Comparison views** — Before/after, left/right, historical trends
- **Export formats** — PDF, FHIR, HL7 for medical systems

---

## Technical Implementation

### Tech Stack
- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Framer Motion, Zustand, React Router v7
- **Backend**: Express.js + Vercel Serverless Lambda
- **Database**: Supabase PostgreSQL
- **AI Engine**: Google Gemini (clinical analysis, speech generation, sentiment analysis)
- **Communication**: Resend (Email), Twilio (SMS)
- **Deployment**: Vercel (frontend + serverless API)

### Project Structure
```
webapp/
├── server.ts                    # Express API server with all routes
├── src/
│   ├── App.tsx                  # Main app with routing
│   ├── store/DemoContext.tsx    # React context with API integration
│   ├── types/clinical.ts       # TypeScript interfaces
│   ├── services/
│   │   ├── gemini.ts           # Gemini AI service (speech, analysis)
│   │   ├── calendar.ts         # Calendar/scheduling service
│   │   └── poseDetection.ts   # MediaPipe pose detection
│   ├── pages/
│   │   ├── Dashboard.tsx            # Clinic lead dashboard
│   │   ├── HRDashboard.tsx          # HR risk overview + voice analysis
│   │   ├── ClinicalAssessment.tsx   # Clinical MSK assessment tool
│   │   ├── WorkflowMap.tsx          # Interactive workflow visualization
│   │   │
│   │   ├── hr/                      # NEW: HR Assessment Module
│   │   │   ├── WorkforceAssessment.tsx    # Main HR questionnaire hub
│   │   │   ├── QuestionnaireWizard.tsx    # Step-by-step questionnaire engine
│   │   │   ├── CostCalculator.tsx         # Employer cost analysis
│   │   │   ├── ViciousCycleMapper.tsx     # Cascade effect visualizer
│   │   │   ├── DepartmentView.tsx         # Per-department assessment
│   │   │   └── DataImport.tsx             # Raw data upload & analysis
│   │   │
│   │   ├── clinical/                # NEW: Clinical Analysis Module
│   │   │   ├── DataAnalysis.tsx           # 3D data parser & analyzer
│   │   │   ├── TreatmentPlan.tsx          # AI treatment plan generator
│   │   │   ├── TrainingProgram.tsx        # Coach training protocol
│   │   │   └── VoiceReport.tsx            # Voice transcript generator
│   │   │
│   │   ├── patient/                 # Patient-facing assessments
│   │   │   ├── AssessmentHub.tsx
│   │   │   ├── MSKScreen.tsx
│   │   │   ├── MotionCapture.tsx
│   │   │   ├── PostureAnalysis.tsx
│   │   │   ├── AssessmentResults.tsx
│   │   │   └── AssessmentHistory.tsx
│   │   │
│   │   └── admin/                   # Admin views
│   │       ├── EmployeeRiskView.tsx
│   │       ├── ClinicalOverview.tsx
│   │       ├── Interventions.tsx
│   │       ├── ComplianceReports.tsx
│   │       └── EnterpriseAudit.tsx
│   │
│   └── data/mockData.ts        # Demo data
├── api/                         # Vercel serverless functions
├── dist/                        # Production build output
└── vercel.json                  # Deployment configuration
```

---

## API Endpoints

### Core APIs (Existing)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET/POST | `/api/companies` | Company CRUD |
| GET/POST/PUT | `/api/employees` | Employee CRUD with risk enrichment |
| GET/POST | `/api/clinical-assessments` | Clinical assessment CRUD |
| GET/POST/PUT | `/api/hr-risks` | HR risk profile CRUD |
| GET/POST | `/api/interventions` | Intervention management |
| GET | `/api/dashboard/stats` | Aggregate statistics |
| POST | `/api/analyze-speech` | Gemini voice sentiment analysis |
| POST | `/api/send-email` | Email via Resend |
| POST | `/api/send-sms` | SMS via Twilio |

### New APIs (HR Workforce Assessment)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/hr/questionnaire` | Submit completed questionnaire |
| GET | `/api/hr/questionnaire/:type` | Get questionnaire template |
| GET | `/api/hr/cost-analysis/:companyId` | Employer cost breakdown |
| POST | `/api/hr/deploy-assessment` | Deploy questionnaire to department |
| GET | `/api/hr/vicious-cycle/:deptId` | Get cascade effect data |
| POST | `/api/hr/analyze-patterns` | AI pattern detection on responses |

### New APIs (Clinical Analysis)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/clinical/import-data` | Import raw 3D assessment data |
| POST | `/api/clinical/generate-treatment` | AI treatment plan generation |
| POST | `/api/clinical/generate-training` | AI training program generation |
| POST | `/api/clinical/voice-report` | Generate voice explanation |
| GET | `/api/clinical/analysis/:employeeId` | Full clinical analysis report |

### New APIs (Data Import)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/data/upload` | Upload raw data file (CSV/JSON/XML) |
| POST | `/api/data/parse` | Parse and validate uploaded data |
| GET | `/api/data/analysis/:id` | Get analysis results |
| POST | `/api/data/correlate` | Cross-correlate clinical + HR data |

---

## Deployment & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd webapp
npm install
```

### Environment Variables
```env
# Google Gemini API (required for AI features)
GEMINI_API_KEY=your_gemini_api_key

# Supabase (required for database)
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Resend (optional - for email)
RESEND_API_KEY=your_resend_api_key

# Twilio (optional - for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Running Locally
```bash
npm run dev
# App available at http://localhost:3000
```

### Building for Production
```bash
npm run build
npm run preview
```

---

## Target Market

### Primary: Large Enterprises (500+ employees)
- Multiple departments with department heads
- Established HR protocols and standards
- Workers compensation and OSHA requirements
- Budget for wellness programs
- High cost of absenteeism and turnover

### Use Cases:
1. **Manufacturing** — Physical demands, injury prevention, shift work fatigue
2. **Healthcare** — Double shifts, burnout cycles, high turnover
3. **Corporate/Tech** — Sedentary risks, mental health, engagement
4. **Retail/Hospitality** — Schedule variability, physical demands, high turnover
5. **Construction** — Safety compliance, physical assessment, injury tracking

---

## License

Private - All rights reserved
