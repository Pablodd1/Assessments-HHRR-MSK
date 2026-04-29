# AI Clinic Lead Management Dashboard

This application is a specialized platform for wellness clinics to manage patient leads, automate intake analysis, and streamline the conversion process using AI.

## 🚀 Core Functionalities

### 1. AI-Powered Patient Intake
- **Automatic Summarization**: Uses Gemini AI to analyze raw intake form data and provide a concise "Intake Summary" for clinicians.
- **Sentiment & Intent Analysis**: Categorizes leads into High, Medium, or Low intent based on their responses.
- **Suggested Tracks**: The AI recommends specific follow-up programs (e.g., "Weight Management", "Anti-Aging") based on patient interests.

### 2. Intelligent Communication Sequences
- **Dynamic Content Generation**: Generates personalized 3-day email and SMS sequences tailored to a patient's specific health goals.
- **AI Subject Lines**: Dynamically generates engaging subject lines for each email in a sequence to maximize open rates.
- **One-Click Regeneration**: Allows clinic staff to iterate on AI-generated content before sending.

### 3. Automated Scheduling & Sync
- **Google Calendar Integration**: Confirmed appointments are automatically synced to the provider's Google Calendar using OAuth2.
- **Audit Trail**: Every booking sends a confirmation email and SMS simultaneously, logged in the patient's timeline.
- **Accessibility**: Includes a Text-to-Speech (TTS) confirmation feature that reads out appointment details for verification.

### 4. Smart Task Management
- **Prioritization**: Tasks are automatically generated for clinicians (e.g., "Review High Intent lead").
- **Sorting Logic**: Dashboard sections for pending and completed tasks allow sorting by Due Date or Patient Name for better organization.
- **Visual Feedback**: Real-time animations (via Framer Motion) provide instant feedback when tasks are completed or updated.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18 with Vite.
- **Styling**: Tailwind CSS for a modern, responsive interface.
- **Animations**: Framer Motion for smooth transitions and interactive UI elements.
- **AI Engine**: Google Gemini API (`@google/genai`) for text generation, analysis, and speech synthesis.
- **Integration**: Google Calendar API for scheduling synchronization.
- **State Management**: React Context API (`DemoContext`) for unified data flow across leads and tasks.

---

## 📈 How to Scale

To transition this application from a prototype to a production-scale healthcare platform, we recommend the following roadmap:

### 1. Transition to a Persistent Backend
Currently, the app uses a `DemoContext` with local state. To scale:
- **Database**: Implement **Firebase Firestore** or a **PostgreSQL** database to persist patient records and clinician tasks.
- **Authentication**: Integrate **Firebase Auth** or **Auth0** to provide secure, role-based access for clinic staff (Admins vs. Clinicians).

### 2. HIPAA Compliance & Security
- **Data Encryption**: Ensure all Patient Health Information (PHI) is encrypted at rest and in transit.
- **Audit Logs**: Implement strict logging of who accessed which patient record and when.
- **BAA Agreements**: Ensure all third-party services (like Google Cloud or Firebase) have active Business Associate Agreements (BAA) for HIPAA compliance.

### 3. Real-Time Collaboration
- **WebSockets**: Use Socket.io or Firebase real-time listeners so multiple staff members can see lead updates or task completions instantly without refreshing.
- **Push Notifications**: Integrate browser push notifications for "High Intent" leads to ensure immediate follow-up.

### 4. Advanced AI Integration
- **Voice Intake**: Allow patients to record their symptoms via audio and use Gemini to transcribe and analyze the audio directly.
- **Predictive Analytics**: Analyze historical conversion data to predict which patients are most likely to book a consultation.

### 5. Multi-Clinic Support (SaaS Model)
- **Multi-Tenancy**: Refactor the database schema to support multiple clinics, each with their own isolated data, providers, and settings.
- **Whitelabeling**: Allow clinics to customize the branding of the landing pages and communication templates.
