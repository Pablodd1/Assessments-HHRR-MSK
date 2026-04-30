# HR Risk Clinical Assessment Platform

A comprehensive workforce health management platform that combines clinical MSK (Musculoskeletal) assessments with HR risk analytics to help organizations identify, monitor, and intervene on employee wellness risks.

## Features

- **Clinical Assessments**: Track MSK screenings, 3D motion analysis, and posture assessments
- **HR Risk Analytics**: Monitor turnover risk, burnout, engagement, and absenteeism
- **AI-Powered Insights**: Gemini-powered speech analysis and risk prediction
- **Intervention Management**: Create and track wellness interventions
- **Real-time Dashboard**: Visualize workforce health metrics and risk trends
- **Multi-channel Communication**: Email and SMS integration for follow-ups

## Competitive Landscape

| Platform | Price | Strength | Gap vs Our App |
|----------|-------|----------|----------------|
| **Spring Health** | $0-8/emp/mo | Mental health AI, care navigation | No MSK/motion capture |
| **Virgin Pulse/Perkpal** | $3-6/emp/mo | Corporate wellness scale | Old UX, generic assessments |
| **Limeade** | $3-5/emp/mo | Employee engagement | Limited clinical depth |
| **Gympass** | $5-10/emp/mo | Fitness network | No injury prevention |
| **KinetSense AI** | Enterprise | 3D motion capture | No HR/wellness layer |
| **Physiomotion** | Enterprise | MSK telehealth | No corporate HR risk |

### Our Unfair Advantages
1. **Unified clinical + HR risk** in one employee profile
2. **KinetSense-style motion capture** with skeleton overlay UI
3. **8-region body map** MSK pain/stiffness mapping
4. **Voice-to-text sentiment analysis** for HR interventions
5. **Occupational health + clinical** integration (OSHA, ADA, workers comp)

## Production Roadmap

### P0 - Ship Now
- [x] MSK Screening with body map (DONE)
- [x] 3D Motion Capture with camera (DONE)
- [x] Posture Photo Analysis (DONE)
- [x] HR Risk Dashboard (DONE)
- [x] Employee Risk Profiles (DONE)
- [x] Voice-to-text AI sentiment analysis (DONE)
- [x] Intervention Management (DONE)
- [x] Compliance/audit reports (DONE)
- [ ] **Scheduling module** — calendar booking + Google Cal sync
- [ ] **Real AI motion analysis** — replace random scores with MediaPipe pose estimation

### P1 - This Quarter
- [ ] Real authentication (JWT/OAuth, role-based)
- [ ] HIPAA-compliant data handling + audit logging
- [ ] Email/SMS automation (Resend + Twilio wired up)
- [ ] PDF report generation
- [ ] Real-time notifications (SSE/WebSocket)

### P2 - Next Quarter
- [ ] HRIS integrations (Workday, BambooHR)
- [ ] Multi-tenant architecture (multiple companies)
- [ ] PWA with offline support for field assessments
- [ ] Advanced predictive analytics + benchmarking
- [ ] Corporate wellness gamification

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Framer Motion
- **Backend**: Express.js, better-sqlite3
- **AI**: Google Gemini (generateContent API)
- **Communication**: Resend (Email), Twilio (SMS)

## Project Structure

```
Assessments-HHRR-MSK/
├── server.ts           # Express API server with all routes
├── src/
│   ├── db.ts           # SQLite database setup and seed data
│   ├── store/
│   │   └── DemoContext.tsx   # React context with API integration
│   ├── pages/
│   │   ├── HRDashboard.tsx   # Main HR dashboard with staff management
│   │   └── admin/
│   │       └── EmployeeRiskView.tsx  # Individual employee risk view
│   └── services/
│       └── gemini.ts   # Gemini AI service
├── data/               # SQLite database file (created on first run)
└── vercel.json         # Vercel deployment configuration
```

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Assessments-HHRR-MSK

# Install dependencies
npm install

# Create data directory for SQLite
mkdir -p data
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API (required for AI features)
GEMINI_API_KEY=your_gemini_api_key

# Resend (optional - for email sending)
RESEND_API_KEY=your_resend_api_key

# Twilio (optional - for SMS sending)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Running Locally

```bash
# Development mode (starts both Vite dev server and Express API)
npm run dev

# The app will be available at http://localhost:3000
# API runs on http://localhost:3000/api
```

### Building for Production

```bash
# Build the frontend
npm run build

# Preview production build
npm run preview
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Companies

#### GET /api/companies
List all companies.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Apex Healthcare Group",
    "industry": "Healthcare",
    "size": "500-1000 employees",
    "created_at": "2026-04-29T00:00:00.000Z"
  }
]
```

#### POST /api/companies
Create a new company.

**Request Body:**
```json
{
  "name": "Company Name",
  "industry": "Industry",
  "size": "100-500 employees"
}
```

### Employees

#### GET /api/employees
List all employees with their HR risks and assessments.

**Response:**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "name": "Robert Wilson",
    "email": "rwilson@company.com",
    "department": "Operations",
    "position": "Front Desk Lead",
    "role": "Staff",
    "hire_date": "2022-03-15",
    "hrRisk": {
      "id": 1,
      "employee_id": 1,
      "turnover_risk": "High",
      "motivation_level": 45,
      "performance_score": 65,
      "sick_days": 8,
      "notes": "High burnout due to frequent double shifts..."
    },
    "clinicalAssessments": [...],
    "interventions": [...]
  }
]
```

#### GET /api/employees/:id
Get a specific employee with full details.

#### POST /api/employees
Create a new employee.

**Request Body:**
```json
{
  "company_id": 1,
  "name": "John Doe",
  "email": "jdoe@company.com",
  "department": "Engineering",
  "position": "Software Engineer",
  "role": "Staff",
  "hire_date": "2024-01-15"
}
```

#### PUT /api/employees/:id
Update an employee.

### Clinical Assessments

#### GET /api/clinical-assessments
List all clinical assessments.

#### POST /api/clinical-assessments
Create a new clinical assessment.

**Request Body:**
```json
{
  "employee_id": 1,
  "type": "MSK_SCREEN",
  "data_json": {
    "regions": [...],
    "totalRiskScore": 72,
    "riskLevel": "High"
  },
  "risk_score": 72,
  "risk_level": "High"
}
```

#### GET /api/clinical-assessments/:employeeId
Get all assessments for a specific employee.

### HR Risks

#### GET /api/hr-risks
List all HR risks with employee info.

**Response:**
```json
[
  {
    "id": 1,
    "employee_id": 1,
    "turnover_risk": "High",
    "motivation_level": 45,
    "performance_score": 65,
    "sick_days": 8,
    "notes": "High burnout...",
    "name": "Robert Wilson",
    "department": "Operations"
  }
]
```

#### POST /api/hr-risks
Create an HR risk entry for an employee.

#### GET /api/hr-risks/:employeeId
Get HR risk for a specific employee.

#### PUT /api/hr-risks/:employeeId
Update HR risk data.

**Request Body:**
```json
{
  "turnover_risk": "High",
  "motivation_level": 55,
  "performance_score": 70,
  "sick_days": 5,
  "notes": "Updated notes..."
}
```

### Interventions

#### GET /api/interventions
List all interventions. Optional query params: `employee_id`, `status`.

#### POST /api/interventions
Create a new intervention.

**Request Body:**
```json
{
  "employee_id": 1,
  "type": "wellness",
  "description": "Ergonomic workstation assessment",
  "status": "active"
}
```

### Dashboard

#### GET /api/dashboard/stats
Get aggregate dashboard statistics.

**Response:**
```json
{
  "totalEmployees": 19,
  "totalCompanies": 2,
  "riskStats": {
    "total": 19,
    "highRisk": 4,
    "avgMotivation": 62,
    "avgPerformance": 74,
    "totalSickDays": 62
  },
  "assessmentStats": {
    "total": 4,
    "avgRiskScore": 69,
    "highRiskCount": 2
  },
  "interventionStats": {
    "total": 5,
    "active": 2,
    "completed": 1,
    "pending": 2
  },
  "departmentBreakdown": [
    { "department": "Operations", "count": 5, "avgMotivation": 55 }
  ]
}
```

### Speech Analysis

#### POST /api/analyze-speech
Analyze text/speech content for sentiment and suggestions.

**Request Body:**
```json
{
  "text_context": "Employee feedback text here..."
}
```

**Response:**
```json
{
  "transcription": "The feedback text...",
  "sentiment": "Negative",
  "toneIndex": 35,
  "keyThemes": ["Workload", "Burnout"],
  "suggestedIntervention": "Consider scheduling a one-on-one to discuss workload management"
}
```

### Email & SMS

#### POST /api/send-email
Send an email via Resend.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Subject Line",
  "html": "<p>Email content...</p>"
}
```

#### POST /api/send-sms
Send an SMS via Twilio.

**Request Body:**
```json
{
  "to": "+1234567890",
  "body": "SMS message content..."
}
```

## Database Schema

### companies
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Company name |
| industry | TEXT | Industry sector |
| size | TEXT | Company size |
| created_at | TEXT | Creation timestamp |

### employees
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| company_id | INTEGER | FK to companies |
| name | TEXT | Employee name |
| email | TEXT | Email (unique) |
| department | TEXT | Department |
| position | TEXT | Job position |
| role | TEXT | System role |
| hire_date | TEXT | Hire date |
| created_at | TEXT | Creation timestamp |

### clinical_assessments
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| employee_id | INTEGER | FK to employees |
| type | TEXT | Assessment type |
| data_json | TEXT | JSON assessment data |
| risk_score | REAL | Calculated risk score |
| risk_level | TEXT | Risk level |
| created_at | TEXT | Creation timestamp |

### hr_risks
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| employee_id | INTEGER | FK to employees (unique) |
| turnover_risk | TEXT | Low/Medium/High/Critical |
| motivation_level | INTEGER | 0-100 |
| performance_score | INTEGER | 0-100 |
| sick_days | INTEGER | Sick days count |
| notes | TEXT | Risk notes |
| updated_at | TEXT | Last update |

### interventions
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| employee_id | INTEGER | FK to employees |
| type | TEXT | Intervention type |
| description | TEXT | Description |
| status | TEXT | pending/active/completed |
| created_at | TEXT | Creation timestamp |

## Seed Data

The database is automatically seeded with:
- 2 companies (Apex Healthcare Group, Metro Sports & Wellness)
- 19 employees across various departments
- HR risk profiles for all employees
- 4 clinical assessments (MSK and motion analysis)
- 5 interventions

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note:** For Vercel deployment, the SQLite database runs in read-only mode. For production use with SQLite, consider deploying to a VPS or using a hosted database solution.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### VPS/Raspberry Pi

```bash
# Clone and install
git clone <repo>
cd Assessments-HHRR-MSK
npm install

# Set environment variables
export GEMINI_API_KEY=your_key

# Run in production
NODE_ENV=production npm run dev
```

## Accessing the App

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Login as different roles:
   - **HR**: Full access to HR dashboard and employee risk views
   - **Admin**: Full system access
   - **Management**: Limited view access
   - **Staff**: Patient-facing features

## Frontend API Integration

All frontend components fetch data from the Express API on port 3000. The `DemoContext` provides:

- `employees`: Array of all employees with risk profiles
- `employeeRisks`: HR risk summaries for dashboard
- `refreshEmployees()`: Reload employee data
- `refreshEmployeeRisks()`: Reload HR risk data
- `updateEmployeeRisk(id, data)`: Update risk via API

### API Base URL

```typescript
const API_BASE = 'http://localhost:3000/api';
```

## Troubleshooting

### Database Errors
- Ensure the `data/` directory exists and is writable
- Delete `data/app.db` to reset the database (will re-seed on restart)

### API Connection Issues
- Verify the Express server is running on port 3000
- Check CORS settings if accessing from different origin

### Gemini API Errors
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota and billing status

## License

Private - All rights reserved
