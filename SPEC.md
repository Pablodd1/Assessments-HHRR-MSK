# HR Corporate Risk Assessment + Clinical Body Assessment Platform

## 1. Concept & Vision

A dual-lens enterprise platform: **Corporate Risk Officers** get AI-powered workforce behavioral risk modeling, compliance reporting, and predictive attrition analytics. **Employees/Patients** get a sleek mobile-first clinical body assessment app (MSK/motion capture, 3D body scanning inspired by KinetSense AI, health tracking). Both views share a unified data layer that correlates clinical health signals with workforce productivity metrics.

---

## 2. Competitive Landscape

### Direct Competitors

| Platform | Price | Core Strength | Clinical Feature | HR Risk Feature | Weakness |
|----------|-------|-------------|-----------------|-----------------|----------|
| **Spring Health** | $0-8/emp/mo | Mental health + work-life AI matching | AI mental health triage, care navigation | Productivity analytics, manager training | No physical/MSK, no motion capture |
| **Virgin Pulse / Perkpal** | $3-6/emp/mo | Corporate wellness giant | Biometric screenings, health risk assessments | Broad HR engagement, challenges | Old UX, generic assessments |
| **Limeade** | $3-5/emp/mo | Employee engagement platform | Well-being surveys, health content | Engagement scoring, recognition | Limited clinical depth |
| **Gympass** | $5-10/emp/mo | Fitness network access | Gym/personal training network | Activity tracking, usage analytics | No injury prevention, no HR risk |
| **KinetSense AI** | Enterprise | 3D motion capture + injury prediction | Markerless motion capture, range of motion | Injury cost analytics | No HR/wellness layer, enterprise-only |
| **Physiomotion** | Enterprise | Physical therapy + MSK | Telehealth, rehab programs | OSHA injury tracking | No corporate HR risk, clinical-only |
| **Our App** | TBD | Unified clinical + HR risk | MSK screening, 3D motion, posture photo | Turnover risk, burnout, engagement | Scheduling empty, AI mocked, no SMS/email automation |

### Our Differentiators
1. **Unified clinical + HR risk** — Only platform correlating MSK body data with workforce productivity
2. **KinetSense-style motion capture UI** — Mobile-first camera capture with skeleton overlay
3. **Body map MSK assessment** — Visual 8-region pain/stiffness mapping with work factor correlation
4. **Voice-to-text HR analysis** — Manager voice notes analyzed for sentiment and intervention suggestions
5. **3-tier risk stratification** — Individual employee → Department → Enterprise board view

### Features competitors MISS that we have
- Combined MSK + turnover risk + burnout in one employee profile
- Occupational health + clinical body assessment integration
- MSK work risk factors (prolonged sitting, heavy lifting, ergonomics) tied to injury prevention
- Corporate compliance dashboard (OSHA, ADA, workers comp)

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

## 3. User Roles

1. **Employee/Patient** → QR Scan → Body Assessment App → Clinical Analysis
2. **HR Manager** → Dashboard → Employee Risk Profiles → Interventions
3. **Risk Officer** → Enterprise Audit → Compliance Reports → Board View
4. **Admin** → Full System Config → User Management → AI Settings

---

## 4. Data Model

- `Employee`: id, name, email, department, position, riskProfile, clinicalAssessment, bodyScanData
- `RiskProfile`: turnoverRisk, burnoutScore, absenteeismIndex, engagementScore, mskRiskScore, financialRiskScore, complianceStatus
- `ClinicalAssessment`: rangeOfMotion, postureAnalysis, mskRiskFactors, recommendedPrograms
- `BodyScanData`: scanType, capturedData, riskFlags, progressHistory, aiAnalysis

---

## 5. Pages

### Patient/Employee Routes
- `/` — Role selection / Login
- `/assessment` — Assessment type selection
- `/msk-screen` — MSK Risk Self-Assessment
- `/3d-assessment` — 3D Motion Capture
- `/posture-analysis` — Posture Photo Assessment
- `/results/:id` — Assessment Results

### Admin Routes
- `/dashboard` — Main HR Dashboard
- `/hr` — HR & Risk Overview
- `/employees` — Employee Risk Profiles
- `/employee/:id` — Individual Employee Deep Dive
- `/audit` — Enterprise Audit
- `/clinical` — Clinical Data Overview
- `/interventions` — Intervention Management
- `/reports` — Compliance & Custom Reports
