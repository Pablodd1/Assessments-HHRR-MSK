# HR Corporate Risk Assessment + Clinical Body Assessment Platform

## 1. Concept & Vision

A dual-lens enterprise platform: **Corporate Risk Officers** get AI-powered workforce behavioral risk modeling, compliance reporting, and predictive attrition analytics. **Employees/Patients** get a sleek mobile-first clinical body assessment app (MSK/motion capture, 3D body scanning inspired by KinetSense AI, health tracking). Both views share a unified data layer that correlates clinical health signals with workforce productivity metrics.

---

## 2. Design Language

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
