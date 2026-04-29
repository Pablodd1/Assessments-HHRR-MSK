# HR Corporate Risk Assessment + Clinical Body Assessment Platform

> **Assessments-HHRR-MSK** — A comprehensive dual-lens enterprise platform combining **Corporate HR Risk Modeling** with **Clinical Body Assessment** (MSK/Motion/Posture). Built on React + Vite + Express + Tailwind CSS with AI-powered analysis.

---

## What This App Does

### Corporate HR Risk Side (Admin/HR View)
- **AI-Powered Risk Profiling**: Predictive attrition scoring using burnout, absenteeism, engagement, MSK risk, and financial risk data
- **Employee Risk Deep Dive**: Individual employee profiles correlating clinical MSK data with workforce risk
- **Enterprise Audit Dashboard**: Company-wide risk distribution, department breakdowns, and AI strategic recommendations
- **Clinical Overview**: MSK heatmaps by body region, program enrollment tracking, assessment type breakdown
- **Interventions Manager**: AI-recommended wellness programs with progress tracking
- **Compliance Reporting**: GDPR Article 9 compliant health data processing, OSHA reports, regulatory documentation

### Patient/Employee Clinical Side (User-Facing)
- **MSK Risk Screen**: Interactive body map with pain/stiffness ratings per region, work risk factor assessment, activity limitations
- **3D Motion Assessment**: Camera-based movement capture with AI skeleton analysis (squat, overhead reach, gait tests)
- **Posture Analysis**: Photo-based posture evaluation with body alignment scoring and corrective exercise prescriptions
- **Assessment Results**: Comprehensive clinical summaries with personalized recommendations
- **Assessment History**: Complete tracking of all past assessments with trend analysis

---

## Competitive Analysis

### Direct Competitors

| Competitor | Strengths | Weaknesses | Our Advantage |
|---|---|---|---|
| **Visier People** | Strong HR analytics, workforce planning | No clinical/MSK data, expensive enterprise pricing | Clinical body assessment + MSK risk correlation |
| **Ultimate Kronos (UKG)** | Attendance, scheduling, HR core | No AI risk prediction, no body assessment | Unified clinical + risk data layer |
| **HEAVENLY** (MSK Platform) | MSK clinical focus, exercise prescription | HR/risk blind, no enterprise reporting | Full-stack HR + clinical integration |
| **KinetSense AI** | 3D motion capture technology | Standalone motion only, no HR risk | Motion capture WITH risk correlation |
| **Spring Health** | Mental health + EAP | No MSK/body, different use case | Physical health + mental + financial risk |
| **Hinge Health** | MSK coaching, wearable integration | Employer-only, no individual assessment app | User-facing patient app with QR access |
| **Kaia Health** | Digital MSK treatment | Clinical only, no HR risk data | HR risk + clinical data in ONE platform |
| **Sword Health** | MSK therapy | No predictive HR analytics | AI-driven attrition prediction from MSK data |
| **Quantiful/Safetype** | AI workplace safety | General safety, not body assessment | Clinical body scan WITH risk profiling |
| **Jifik/PhysiApp** | MSK physiotherapy | No AI, no enterprise reporting | AI analysis + predictive risk modeling |
| **ErgoPlus** | Ergonomic assessment | Manual assessments, no AI | AI-powered 3D motion + ergonomic correlation |
| **Occupational Health Platforms** (Cority, Enablon) | Compliance focus | Legacy systems, poor UX, no AI | Modern React UX + AI + clinical body scans |

### Key Differentiators

1. **Only platform combining clinical body assessment (MSK/motion/posture) with HR predictive risk modeling**
2. **MSK Risk Score as a direct predictor of turnover and burnout** — unique correlation not found in competitors
3. **User-facing clinical assessment app** (patient QR-based flow) — competitors focus on employer-only dashboards
4. **AI-powered clinical summaries** generated from physical assessment data
5. **GDPR-compliant health data architecture** with explicit consent tracking
6. **Modern React + Framer Motion UI** vs. legacy enterprise platforms

---

## Technology Stack

- **Frontend**: React 19 + Vite 6 + React Router 7 + Framer Motion 12
- **Styling**: Tailwind CSS 4
- **Backend**: Express.js + tsx
- **AI**: Google Gemini 2.0 Flash (via @google/genai)
- **State**: Zustand
- **Icons**: Lucide React
- **Email**: Resend
- **SMS**: Twilio

---

## Getting Started

```bash
npm install
npm run dev        # Start development server (port 3000)
npm run build      # Production build to dist/
```

Set environment variables in `.env`:
```
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
GEMINI_API_KEY=your_gemini_key
```

---

## User Roles

| Role | Access |
|---|---|
| **Patient** | QR scan → Assessment app → Results |
| **HR** | HR Dashboard, Employee Risk Profiles, Interventions |
| **Management** | Enterprise Audit, Compliance Reports, All HR views |
| **Admin** | Full system, user management, AI settings |

---

## Project Structure

```
src/
├── App.tsx              # Main app with routing
├── store/DemoContext.tsx # All state + mock data
├── pages/
│   ├── patient/          # User-facing assessment pages
│   │   ├── AssessmentHub.tsx
│   │   ├── MSKScreen.tsx
│   │   ├── MotionCapture.tsx
│   │   ├── PostureAnalysis.tsx
│   │   ├── AssessmentResults.tsx
│   │   └── AssessmentHistory.tsx
│   ├── admin/           # Admin/HR pages
│   │   ├── EmployeeRiskView.tsx
│   │   ├── ClinicalOverview.tsx
│   │   ├── Interventions.tsx
│   │   ├── ComplianceReports.tsx
│   │   └── EnterpriseAudit.tsx
│   └── assessments/     # Staff audit pages
server.ts                 # Express + Vite SSR server
```

---

## License

Proprietary — AI Dynamics / Hermes AI
