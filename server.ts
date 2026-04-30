import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import twilio from "twilio";
import dotenv from "dotenv";
import db from "./src/db.js";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database row types
interface DbCompany { id: number; name: string; industry: string; size: string; created_at: string; }
interface DbEmployee { id: number; company_id: number | null; name: string; email: string; department: string; position: string; role: string; hire_date: string; created_at: string; company_name?: string; company_industry?: string; company_size?: string; }
interface DbHRRisk { id: number; employee_id: number; turnover_risk: string; motivation_level: number; performance_score: number; sick_days: number; notes: string; updated_at: string; name?: string; department?: string; position?: string; }
interface DbAssessment { id: number; employee_id: number; type: string; data_json: string; risk_score: number; risk_level: string; created_at: string; employee_name?: string; department?: string; }
interface DbIntervention { id: number; employee_id: number; type: string; description: string; status: string; created_at: string; employee_name?: string; department?: string; }

// Initialize Resend
let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

// Initialize Twilio
let twilioClient: twilio.Twilio | null = null;
function getTwilio() {
  if (!twilioClient) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required");
    }
    twilioClient = twilio(sid, token);
  }
  return twilioClient;
}

// Initialize Gemini
let geminiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }
  return geminiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─────────────────────────────────────────
// Companies Routes
// ─────────────────────────────────────────
app.get("/api/companies", (req, res) => {
  try {
    const companies = db.prepare("SELECT * FROM companies ORDER BY name").all();
    res.json(companies);
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/companies", (req, res) => {
  try {
    const { name, industry, size } = req.body;
    if (!name || !industry || !size) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = db.prepare(
      "INSERT INTO companies (name, industry, size) VALUES (?, ?, ?)"
    ).run(name, industry, size);
    res.status(201).json({ id: result.lastInsertRowid, name, industry, size });
  } catch (error: any) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// Employees Routes
// ─────────────────────────────────────────
app.get("/api/employees", (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT e.*, c.name as company_name, c.industry as company_industry, c.size as company_size
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      ORDER BY e.name
    `).all();
    
    // Fetch related data for each employee
    const employeesWithData = employees.map((emp: any) => {
      const hrRisk = db.prepare("SELECT * FROM hr_risks WHERE employee_id = ?").get(emp.id);
      const assessments = db.prepare("SELECT * FROM clinical_assessments WHERE employee_id = ?").all(emp.id);
      const interventions = db.prepare("SELECT * FROM interventions WHERE employee_id = ?").all(emp.id);
      
      return {
        ...emp,
        hrRisk,
        clinicalAssessments: assessments,
        interventions
      };
    });
    
    res.json(employeesWithData);
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", (req, res) => {
  try {
    const { company_id, name, email, department, position, role, hire_date } = req.body;
    if (!name || !email || !department || !position || !hire_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = db.prepare(`
      INSERT INTO employees (company_id, name, email, department, position, role, hire_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(company_id || null, name, email, department, position, role || "Staff", hire_date);
    
    // Create default HR risk entry
    db.prepare(`
      INSERT INTO hr_risks (employee_id, turnover_risk, motivation_level, performance_score, sick_days, notes)
      VALUES (?, 'Low', 70, 75, 0, '')
    `).run(result.lastInsertRowid);
    
    res.status(201).json({ id: result.lastInsertRowid, message: "Employee created" });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/employees/:id", (req, res) => {
  try {
    const { id } = req.params;
    const employee = db.prepare(`
      SELECT e.*, c.name as company_name, c.industry as company_industry, c.size as company_size
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.id = ?
    `).get(id);
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    const hrRisk = db.prepare("SELECT * FROM hr_risks WHERE employee_id = ?").get(id);
    const assessments = db.prepare("SELECT * FROM clinical_assessments WHERE employee_id = ? ORDER BY created_at DESC").all(id);
    const interventions = db.prepare("SELECT * FROM interventions WHERE employee_id = ? ORDER BY created_at DESC").all(id);
    
    res.json({
      ...(employee as any),
      hrRisk,
      clinicalAssessments: assessments,
      interventions
    });
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/employees/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, position, role, hire_date } = req.body;
    
    const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    db.prepare(`
      UPDATE employees SET name = ?, email = ?, department = ?, position = ?, role = ?, hire_date = ?
      WHERE id = ?
    `).run(name || (employee as any).name, email || (employee as any).email, department || (employee as any).department, position || (employee as any).position, role || (employee as any).role, hire_date || (employee as any).hire_date, id);
    
    res.json({ message: "Employee updated" });
  } catch (error: any) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// Clinical Assessments Routes
// ─────────────────────────────────────────
app.get("/api/clinical-assessments", (req, res) => {
  try {
    const assessments = db.prepare(`
      SELECT ca.*, e.name as employee_name, e.department
      FROM clinical_assessments ca
      JOIN employees e ON ca.employee_id = e.id
      ORDER BY ca.created_at DESC
    `).all();
    
    const parsed = assessments.map((a: any) => ({
      ...a,
      data_json: JSON.parse(a.data_json)
    }));
    
    res.json(parsed);
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/clinical-assessments", (req, res) => {
  try {
    const { employee_id, type, data_json, risk_score, risk_level } = req.body;
    if (!employee_id || !type || !data_json) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = db.prepare(`
      INSERT INTO clinical_assessments (employee_id, type, data_json, risk_score, risk_level)
      VALUES (?, ?, ?, ?, ?)
    `).run(employee_id, type, JSON.stringify(data_json), risk_score || 0, risk_level || "Low");
    
    res.status(201).json({ id: result.lastInsertRowid, message: "Assessment created" });
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clinical-assessments/:employeeId", (req, res) => {
  try {
    const { employeeId } = req.params;
    const assessments = db.prepare(`
      SELECT * FROM clinical_assessments WHERE employee_id = ? ORDER BY created_at DESC
    `).all(employeeId);
    
    const parsed = assessments.map((a: any) => ({
      ...a,
      data_json: JSON.parse(a.data_json)
    }));
    
    res.json(parsed);
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// HR Risks Routes
// ─────────────────────────────────────────
app.get("/api/hr-risks", (req, res) => {
  try {
    const risks = db.prepare(`
      SELECT hr.*, e.name, e.department, e.position, e.email
      FROM hr_risks hr
      JOIN employees e ON hr.employee_id = e.id
      ORDER BY 
        CASE hr.turnover_risk WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
        hr.employee_id
    `).all();
    res.json(risks);
  } catch (error: any) {
    console.error("Error fetching HR risks:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/hr-risks", (req, res) => {
  try {
    const { employee_id, turnover_risk, motivation_level, performance_score, sick_days, notes } = req.body;
    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }
    
    // Check if risk entry exists
    const existing = db.prepare("SELECT id FROM hr_risks WHERE employee_id = ?").get(employee_id);
    if (existing) {
      return res.status(400).json({ error: "HR risk entry already exists for this employee" });
    }
    
    const result = db.prepare(`
      INSERT INTO hr_risks (employee_id, turnover_risk, motivation_level, performance_score, sick_days, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(employee_id, turnover_risk || "Low", motivation_level || 70, performance_score || 75, sick_days || 0, notes || "");
    
    res.status(201).json({ id: result.lastInsertRowid, message: "HR risk created" });
  } catch (error: any) {
    console.error("Error creating HR risk:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/hr-risks/:employeeId", (req, res) => {
  try {
    const { employeeId } = req.params;
    const risk = db.prepare("SELECT * FROM hr_risks WHERE employee_id = ?").get(employeeId);
    
    if (!risk) {
      return res.status(404).json({ error: "HR risk not found" });
    }
    
    res.json(risk);
  } catch (error: any) {
    console.error("Error fetching HR risk:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/hr-risks/:employeeId", (req, res) => {
  try {
    const { employeeId } = req.params;
    const { turnover_risk, motivation_level, performance_score, sick_days, notes } = req.body;
    
    const existing = db.prepare("SELECT * FROM hr_risks WHERE employee_id = ?").get(employeeId);
    if (!existing) {
      return res.status(404).json({ error: "HR risk not found" });
    }
    
    db.prepare(`
      UPDATE hr_risks SET 
        turnover_risk = COALESCE(?, turnover_risk),
        motivation_level = COALESCE(?, motivation_level),
        performance_score = COALESCE(?, performance_score),
        sick_days = COALESCE(?, sick_days),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
      WHERE employee_id = ?
    `).run(turnover_risk, motivation_level, performance_score, sick_days, notes, employeeId);
    
    const updated = db.prepare("SELECT * FROM hr_risks WHERE employee_id = ?").get(employeeId);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating HR risk:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// Interventions Routes
// ─────────────────────────────────────────
app.get("/api/interventions", (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let query = `
      SELECT i.*, e.name as employee_name, e.department
      FROM interventions i
      JOIN employees e ON i.employee_id = e.id
    `;
    const params: any[] = [];
    
    if (employee_id) {
      query += " WHERE i.employee_id = ?";
      params.push(employee_id);
    }
    if (status) {
      query += params.length ? " AND" : " WHERE";
      query += " i.status = ?";
      params.push(status);
    }
    
    query += " ORDER BY i.created_at DESC";
    
    const interventions = db.prepare(query).all(...params);
    res.json(interventions);
  } catch (error: any) {
    console.error("Error fetching interventions:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/interventions", (req, res) => {
  try {
    const { employee_id, type, description, status } = req.body;
    if (!employee_id || !type || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = db.prepare(`
      INSERT INTO interventions (employee_id, type, description, status)
      VALUES (?, ?, ?, ?)
    `).run(employee_id, type, description, status || "pending");
    
    res.status(201).json({ id: result.lastInsertRowid, message: "Intervention created" });
  } catch (error: any) {
    console.error("Error creating intervention:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// Dashboard Stats Route
// ─────────────────────────────────────────
app.get("/api/dashboard/stats", (req, res) => {
  try {
    const totalEmployees = (db.prepare("SELECT COUNT(*) as count FROM employees").get() as any).count;
    const totalCompanies = (db.prepare("SELECT COUNT(*) as count FROM companies").get() as any).count;
    
    const riskStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN turnover_risk = 'High' OR turnover_risk = 'Critical' THEN 1 ELSE 0 END) as highRisk,
        AVG(motivation_level) as avgMotivation,
        AVG(performance_score) as avgPerformance,
        SUM(sick_days) as totalSickDays
      FROM hr_risks
    `).get() as any;
    
    const assessmentStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(risk_score) as avgRiskScore,
        SUM(CASE WHEN risk_level = 'High' OR risk_level = 'Critical' THEN 1 ELSE 0 END) as highRiskCount
      FROM clinical_assessments
    `).get() as any;
    
    const interventionStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM interventions
    `).get() as any;
    
    const departmentBreakdown = db.prepare(`
      SELECT department, COUNT(*) as count, AVG(hr.motivation_level) as avgMotivation
      FROM employees e
      JOIN hr_risks hr ON e.id = hr.employee_id
      GROUP BY department
      ORDER BY count DESC
    `).all();
    
    res.json({
      totalEmployees,
      totalCompanies,
      riskStats: {
        total: riskStats.total || 0,
        highRisk: riskStats.highRisk || 0,
        avgMotivation: Math.round(riskStats.avgMotivation || 0),
        avgPerformance: Math.round(riskStats.avgPerformance || 0),
        totalSickDays: riskStats.totalSickDays || 0
      },
      assessmentStats: {
        total: assessmentStats.total || 0,
        avgRiskScore: Math.round(assessmentStats.avgRiskScore || 0),
        highRiskCount: assessmentStats.highRiskCount || 0
      },
      interventionStats: {
        total: interventionStats.total || 0,
        active: interventionStats.active || 0,
        completed: interventionStats.completed || 0,
        pending: interventionStats.pending || 0
      },
      departmentBreakdown
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// Speech Analysis Route (Gemini)
// ─────────────────────────────────────────
app.post("/api/analyze-speech", async (req, res) => {
  try {
    const { text_context } = req.body;
    
    if (!text_context) {
      return res.status(400).json({ error: "text_context is required" });
    }
    
    const ai = getGemini();
    const prompt = `
      Analyze the following employee voice feedback.
      Transcription/Text: ${text_context}

      Generate a JSON response with:
      - transcription: (string) The full transcribed text.
      - sentiment: (string) "Positive", "Neutral", "Negative", or "Critical".
      - toneIndex: (number 1-100) A numerical score for positive resonance.
      - keyThemes: (array of strings) 2-3 main concerns or positives identified.
      - suggestedIntervention: (string) A short specific HR recommendation based on the voice tone and content.
      
      Make it professional and objective.
      Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing speech:", error);
    res.status(500).json({ error: error.message || "Failed to analyze speech" });
  }
});

// ─────────────────────────────────────────
// Email/SMS Routes
// ─────────────────────────────────────────
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const resend = getResend();
    
    const data = await resend.emails.send({
      from: "Clinic Demo <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Email error:", error);
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
});

app.post("/api/send-sms", async (req, res) => {
  try {
    const { to, body } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = getTwilio();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error("TWILIO_PHONE_NUMBER environment variable is required");
    }

    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });

    res.json({ success: true, messageId: message.sid });
  } catch (error: any) {
    console.error("SMS error:", error);
    res.status(500).json({ error: error.message || "Failed to send SMS" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
