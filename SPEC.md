# HR Risk Assessment + Clinical Body Assessment Platform — SPEC

---

## 1. Concept & Vision

A dual-lens enterprise platform: **Corporate Risk Officers** get AI-powered workforce behavioral risk modeling, compliance reporting, and predictive attrition analytics. **Employees/Patients** get a sleek mobile-first clinical body assessment app (MSK/motion capture, 3D body scanning inspired by KinetSense AI, health tracking). Both views share a unified data layer that correlates clinical health signals with workforce productivity metrics.

**Tech Stack:** React 19 + TypeScript + TailwindCSS + Framer Motion + Vite + Zustand + Supabase + Gemini AI + Vercel

---

## 2. Competitive Landscape (April 2026)

### Direct Competitors

| Platform | Price | Clinical Depth | HR Risk | MSK/Motion | UX | Key Weakness |
|----------|-------|---------------|---------|------------|----|-------------|
| **Spring Health** | $0-8/emp/mo | Mental health AI triage, care navigation | Productivity analytics, manager training | **NONE** | Modern | No physical/MSK, no motion capture, expensive at scale |
| **Virgin Pulse / Perkpal** | $3-6/emp/mo | Biometric screenings, health risk assessments | Broad HR engagement, challenges | **NONE** | Dated | Generic assessments, no injury prevention, no AI depth |
| **Limeade** | $3-5/emp/mo | Well-being surveys, health content | Engagement scoring, recognition | **NONE** | Corporate | Limited clinical depth, shallow analytics |
| **Gympass** | $5-10/emp/mo | Fitness network access | Activity tracking | **NONE** | Consumer | No injury prevention, no HR risk layer, high per-employee cost |
| **KinetSense AI** | Enterprise | 3D motion capture, markerless motion, ROM | Injury cost analytics | **FULL** | Clinical | No wellness/HR layer, enterprise-only, no employee retention |
| **Physiomotion** | Enterprise | Telehealth PT, rehab programs, MSK | OSHA injury tracking | **FULL** | Clinical | No corporate HR risk, clinical-only, disjointed UX |
| **Hinge Health** | $8-15/emp/mo | Digital MSK clinic, wearable + coaching | N/A | **FULL** | Modern | No HR risk, no corporate analytics layer |
| **One Medical** | Enterprise | Primary care + mental health | Absenteeism analytics | **NONE** | Modern | No MSK, no injury prevention |
| **Enso HR** | Startup | Basic wellness | Turnover risk | **NONE** | Basic | Shallow clinical, no motion capture |
| **Our App** | TBD | MSK screening, 3D motion, posture photo, voice analysis | Turnover risk, burnout, engagement, OSHA/ADA | **FULL** | Modern | Scheduling needs backend, AI mocked (needs real Gemini), no real auth |

### Our Unfair Advantages
1. **Unified clinical + HR risk** — Only platform correlating MSK body data with workforce productivity in one employee profile
2. **KinetSense-style motion capture UI** — Mobile-first camera capture with skeleton overlay (markerless, no equipment)
3. **8-region body map MSK assessment** — Visual pain/stiffness mapping with work factor correlation (prolonged sitting, heavy lifting, ergonomics)
4. **Voice-to-text HR sentiment analysis** — Manager/employee voice notes analyzed for sentiment, burnout, intervention triggers
5. **3-tier risk stratification** — Individual employee → Department → Enterprise C-suite board view
6. **Occupational health + clinical body assessment** — Ties OSHA injury data to clinical MSK findings
7. **Corporate compliance dashboard** — OSHA recordable, ADA accommodations, workers comp claims all in one view

### Features Only We Have
- Combined MSK + turnover risk + burnout + absenteeism in one employee profile
- MSK work risk factors (sitting hours, lifting, ergonomics) tied to injury prediction
- Clinical body assessment QR-code accessible (patient self-service)
- 3D motion capture without markers or equipment (phone camera)
- Real-time AI voice sentiment analysis via Gemini
- OSHA/ADA/workers comp unified compliance dashboard

### Features We Need (Competitive Gaps)
- **Real AI motion analysis** — Currently random scores; need MediaPipe/TensorFlow.js pose estimation
- **Production scheduling backend** — Calendar service connected (Cal.com or Supabase)
- **Real JWT/OAuth auth** — Replace demo role login with Supabase Auth
- **SMS/Email automation** — Real Twilio/Resend integration (currently mocked)
- **Mobile push notifications** — Web push for reminders
- **Wearable integration** — Apple Health/Google Fit API for continuous data

---

## 3. Design Language

- **Primary**: `#6366F1` (Indigo)
- **Secondary**: `#0F172A` (Slate-900)
- **Health/Success**: `#10B981` (Emerald)
- **Risk Critical**: `#EF4444` (Red)
- **Risk Warning**: `#F59E0B` (Amber)
- **Background-Admin**: `#0F172A` (Slate-900)
- **Background-Clinical**: `#F8FAFC` (Slate-50)

---

## 4. User Roles

1. **Patient/Employee** → QR Scan → Body Assessment App → Results + Scheduling
2. **Staff/HR Manager** → Dashboard → Employee Risk Profiles → Interventions → Compliance
3. **Risk Officer** → Enterprise Audit → Board View → Regulatory Reports
4. **Admin** → Full System Config → User Management → AI Settings

---

## 5. Data Model

### Supabase Tables
```
companies       → id, name, industry, size, created_at
employees       → id, company_id, name, email, department, position, role, hire_date
hr_risks        → id, employee_id, turnover_risk, motivation_level, performance_score, sick_days, notes, updated_at
clinical_assessments → id, employee_id, type, data_json, risk_score, risk_level, created_at
interventions   → id, employee_id, type, description, status, created_at
```

---

## 6. Pages (35 pages total)

### Public/Entry
- `/` — Role selection login
- `/landing` — Marketing landing page
- `/interest` — Lead capture form
- `/qr-scan` — QR code scanner redirect
- `/workflow` — Workflow visualization

### Patient/Employee Assessment
- `/assessment` — Assessment hub (MSK, 3D Motion, Posture, Functional)
- `/msk-screen` — 8-region body map MSK self-assessment
- `/3d-assessment` — KinetSense-style motion capture
- `/posture-analysis` — 3-photo posture assessment
- `/results/:id` — Assessment results + AI analysis
- `/history` — Patient assessment history

### HR/Risk (Staff/Management)
- `/dashboard` — Main dashboard with KPI cards + charts
- `/hr` — HR + Risk overview
- `/company` — Company overview with department risk breakdown
- `/audit` — Enterprise audit with filtering
- `/communications` — Email/SMS broadcast center

### Admin
- `/admin` — Admin panel with system config
- `/admin/employees` — Employee management
- `/admin/employees/:id` — Individual employee deep dive
- `/admin/clinical` — Clinical data overview
- `/admin/interventions` — Intervention management
- `/admin/reports` — Compliance + custom reports
- `/admin/enterprise` — Enterprise-level audit

### Assessment Sub-pages
- `/assessments/staff` — Staff audit view
- `/assessments/management` — Management audit view
- `/assessments/hr` — HR audit view
- `/assessments/ai` — AI analysis page
- `/scheduling` — Appointment scheduling page

---

## 7. API Routes (Vercel Serverless)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/companies` | List all companies |
| POST | `/api/companies` | Create company |
| GET | `/api/employees` | List employees with HR risk + assessments |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Single employee with full data |
| PUT | `/api/employees/:id` | Update employee |
| GET | `/api/clinical-assessments` | List clinical assessments |
| POST | `/api/clinical-assessments` | Create clinical assessment |
| POST | `/api/analyze-msk` | AI MSK analysis (Gemini-powered) |
| GET | `/api/hr-risks` | List all HR risk profiles |
| POST | `/api/hr-risks` | Create HR risk profile |
| GET | `/api/hr-risks/:id` | Single HR risk |
| PUT | `/api/hr-risks/:id` | Update HR risk |
| GET | `/api/interventions` | List interventions |
| POST | `/api/interventions` | Create intervention |
| POST | `/api/analyze-speech` | Voice sentiment analysis (Gemini) |
| POST | `/api/send-email` | Send email (Resend) |
| POST | `/api/send-sms` | Send SMS (Twilio) |
| GET | `/api/dashboard/stats` | Dashboard aggregate statistics |

---

## 8. Code Quality Analysis

### Strengths
- **Zero TypeScript errors** — Clean compile, well-typed interfaces
- **Comprehensive type system** — `clinical.ts` has 289 lines of strong typed interfaces
- **Well-structured pages** — 35 pages organized by domain (patient, admin, assessment)
- **Good component diversity** — 3D motion capture, body map, posture analysis, voice input
- **Real integrations wired up** — Gemini AI, Twilio, Resend, Supabase all in server.ts
- **Production Vercel deployment** — Working build pipeline with lambda API
- **Competitive SPEC.md** — Well-documented competitive positioning

### Issues to Fix

**HIGH PRIORITY:**
1. **Scheduling page has no backend** — `Scheduling.tsx` (335 lines) has UI but no calendar service connected. Needs Cal.com or Supabase slot management.
2. **Motion capture is mocked** — `MotionCapture.tsx` uses random/placeholder motion scores. Needs real MediaPipe pose estimation or TensorFlow.js body segmentation.
3. **AI analysis is mocked in production** — `api/analyze-msk` returns random-ish data. Real Gemini integration needs `GEMINI_API_KEY` env var set in Vercel.
4. **Auth is demo-only** — Role login bypasses real auth. Needs Supabase Auth with JWT.
5. **No database migrations** — Supabase schema exists conceptually but no migration files.

**MEDIUM PRIORITY:**
6. **Large bundle (994KB)** — Should use dynamic `import()` for admin/patient routes to split chunks.
7. **No error boundaries** — React app has no error boundary components.
8. **Twilio/Resend env vars missing** — Real email/SMS won't send without `TWILIO_*` and `RESEND_API_KEY` in Vercel env.
9. **No unit tests** — Zero test coverage. Should have Vitest for API handlers and key components.
10. **No rate limiting** — API endpoints have no rate limiting (spam risk).

**LOW PRIORITY:**
11. **Duplicate route definitions** — Both `ClinicalAssessment.tsx` (patient) and `pages/admin/ClinicalOverview.tsx` exist.
12. **No loading skeletons** — Pages show blank space while loading data.
13. **No PWA manifest** — Could be installable as app on mobile.

---

## 9. Roadmap (Priority Order)

### Phase 1 — Production Ready (This Week)
- [x] Fix API routing (vercel.json routes + monofunction handler)
- [x] Fix API_BASE to use relative paths (localhost → origin-based)
- [x] Write complete mock API with all 10 routes
- [ ] Set `GEMINI_API_KEY` in Vercel dashboard → real AI analysis
- [ ] Set `RESEND_API_KEY`, `TWILIO_*` in Vercel → real email/SMS
- [ ] Set `SUPABASE_SERVICE_KEY` in Vercel → real database
- [ ] Enable Vercel deployment protection (after testing complete)

### Phase 2 — Real AI Motion Capture (Week 2)
- [ ] Integrate MediaPipe Pose Estimation in `MotionCapture.tsx`
- [ ] Replace random motion scores with real range-of-motion calculations
- [ ] Add TensorFlow.js body segmentation for posture analysis
- [ ] Real-time skeleton overlay on camera feed

### Phase 3 — Production Auth + Scheduling (Week 3)
- [ ] Supabase Auth with magic link + Google OAuth
- [ ] Role-based routing (Patient → assessment flow, HR → dashboard, etc.)
- [ ] Cal.com integration for appointment scheduling
- [ ] Supabase Realtime for live dashboard updates

### Phase 4 — Mobile + Notifications (Week 4)
- [ ] PWA manifest + service worker for offline body assessment
- [ ] Web push notifications for assessment reminders
- [ ] Apple Health Kit / Google Fit integration
- [ ] SMS appointment reminders via Twilio

### Phase 5 — Enterprise Features (Week 5-6)
- [ ] OSHA incident logging + 300/300A report generation
- [ ] ADA accommodation request workflow
- [ ] Workers comp claim tracking
- [ ] Board-level executive dashboard with PDF export
- [ ] SSO (SAML/OIDC) for enterprise customers

---

## 10. Architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React 19 + Vite + TailwindCSS)           │
│  / → /assessment → /3d-assessment → /results         │
│  /dashboard → /hr → /admin/employees/:id             │
└──────────────────────┬──────────────────────────────┘
                      │ fetch /api/*
┌──────────────────────▼──────────────────────────────┐
│  VERCEL LAMBDA (api/index.ts — monofunction)        │
│  Routes: /api/health, /api/employees, /api/analyze-* │
└──────┬──────────────────────┬──────────────────────┘
       │ Supabase REST         │ External APIs
       ▼                       ▼
┌──────────────┐    ┌─────────────────┐
│  Supabase    │    │  Gemini AI      │
│  PostgreSQL  │    │  Twilio SMS     │
│  (vodhhau..) │    │  Resend Email   │
└──────────────┘    └─────────────────┘
```
