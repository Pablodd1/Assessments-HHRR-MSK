import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import twilio from "twilio";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ─────────────────────────────────────────
// Supabase client
// ─────────────────────────────────────────
const SUPABASE_URL = "https://vodhhauwowkalvaxzqyv.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

async function supabaseRequest(
  table: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options: {
    params?: string;
    body?: Record<string, unknown>;
    id?: string | number;
  } = {}
) {
  const { params, body, id } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (id !== undefined) {
    url += `?id=eq.${id}`;
  } else if (params) {
    url += params;
  }

  const headers: Record<string, string> = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
  if (method === "POST" || method === "PUT" || method === "DELETE") {
    headers["Prefer"] = "return=representation";
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };
  if (body && (method === "POST" || method === "PUT")) {
    fetchOptions.body = JSON.stringify(body);
  }

  const resp = await fetch(url, fetchOptions);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.message || `Supabase error ${resp.status}`);
  return data;
}

// ─────────────────────────────────────────
// Resend
// ─────────────────────────────────────────
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is required");
  return new Resend(key);
}

// ─────────────────────────────────────────
// Twilio
// ─────────────────────────────────────────
function getTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required");
  return twilio(sid, token);
}

// ─────────────────────────────────────────
// Gemini
// ─────────────────────────────────────────
function getGemini() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
}

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "supabase" });
});

// Companies
app.get("/api/companies", async (req, res) => {
  try {
    const data = await supabaseRequest("companies", "GET", { params: "?select=*&order=name" });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/companies", async (req, res) => {
  try {
    const { name, industry, size } = req.body;
    if (!name || !industry || !size) return res.status(400).json({ error: "Missing required fields" });
    const data = await supabaseRequest("companies", "POST", { body: { name, industry, size } });
    res.status(201).json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Employees
app.get("/api/employees", async (req, res) => {
  try {
    // Fetch all employees with company join
    const employees: any[] = await supabaseRequest(
      "employees",
      "GET",
      { params: "?select=*,companies(name,industry,size)&order=name" }
    );

    // Enrich with hr_risks, assessments, interventions
    const enriched = await Promise.all(
      employees.map(async (emp) => {
        const [hrRisks, assessments, interventions] = await Promise.all([
          supabaseRequest("hr_risks", "GET", { params: `?employee_id=eq.${emp.id}` }),
          supabaseRequest("clinical_assessments", "GET", { params: `?employee_id=eq.${emp.id}&order=created_at.desc` }),
          supabaseRequest("interventions", "GET", { params: `?employee_id=eq.${emp.id}&order=created_at.desc` }),
        ]);
        return {
          ...emp,
          company_name: emp.companies?.name,
          company_industry: emp.companies?.industry,
          company_size: emp.companies?.size,
          hrRisk: hrRisks[0] || null,
          clinicalAssessments: assessments.map((a: any) => ({
            ...a,
            data_json: typeof a.data_json === "string" ? JSON.parse(a.data_json) : a.data_json,
          })),
          interventions,
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { company_id, name, email, department, position, role, hire_date } = req.body;
    if (!name || !email || !department || !position || !hire_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const data = await supabaseRequest("employees", "POST", {
      body: { company_id, name, email, department, position, role: role || "Staff", hire_date },
    });
    const newEmp = data[0];

    // Create default HR risk
    await supabaseRequest("hr_risks", "POST", {
      body: { employee_id: newEmp.id, turnover_risk: "Low", motivation_level: 70, performance_score: 75, sick_days: 0, notes: "" },
    });

    res.status(201).json({ id: newEmp.id, message: "Employee created" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employees: any[] = await supabaseRequest(
      "employees",
      "GET",
      { params: `?id=eq.${id}&select=*,companies(name,industry,size)` }
    );
    if (!employees.length) return res.status(404).json({ error: "Employee not found" });

    const emp = employees[0];
    const [hrRisks, assessments, interventions] = await Promise.all([
      supabaseRequest("hr_risks", "GET", { params: `?employee_id=eq.${id}` }),
      supabaseRequest("clinical_assessments", "GET", { params: `?employee_id=eq.${id}&order=created_at.desc` }),
      supabaseRequest("interventions", "GET", { params: `?employee_id=eq.${id}&order=created_at.desc` }),
    ]);

    res.json({
      ...emp,
      company_name: emp.companies?.name,
      company_industry: emp.companies?.industry,
      company_size: emp.companies?.size,
      hrRisk: hrRisks[0] || null,
      clinicalAssessments: assessments.map((a: any) => ({
        ...a,
        data_json: typeof a.data_json === "string" ? JSON.parse(a.data_json) : a.data_json,
      })),
      interventions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, position, role, hire_date } = req.body;
    await supabaseRequest("employees", "PATCH", {
      params: `?id=eq.${id}`,
      body: { name, email, department, position, role, hire_date },
    });
    res.json({ message: "Employee updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clinical Assessments
app.get("/api/clinical-assessments", async (req, res) => {
  try {
    const data: any[] = await supabaseRequest(
      "clinical_assessments",
      "GET",
      { params: "?select=*,employees(name,department)&order=created_at.desc" }
    );
    const parsed = data.map((a) => ({
      ...a,
      data_json: typeof a.data_json === "string" ? JSON.parse(a.data_json) : a.data_json,
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/clinical-assessments", async (req, res) => {
  try {
    const { employee_id, type, data_json, risk_score, risk_level } = req.body;
    if (!employee_id || !type) return res.status(400).json({ error: "Missing required fields" });
    const body = {
      employee_id,
      type,
      data_json: typeof data_json === "string" ? data_json : JSON.stringify(data_json),
      risk_score: risk_score || 0,
      risk_level: risk_level || "Low",
    };
    const data = await supabaseRequest("clinical_assessments", "POST", { body });
    res.status(201).json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clinical-assessments/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data: any[] = await supabaseRequest(
      "clinical_assessments",
      "GET",
      { params: `?employee_id=eq.${employeeId}&order=created_at.desc` }
    );
    const parsed = data.map((a) => ({
      ...a,
      data_json: typeof a.data_json === "string" ? JSON.parse(a.data_json) : a.data_json,
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// HR Risks
app.get("/api/hr-risks", async (req, res) => {
  try {
    const data: any[] = await supabaseRequest(
      "hr_risks",
      "GET",
      { params: "?select=*,employees(name,department,position,email)&order=turnover_risk,employee_id" }
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/hr-risks", async (req, res) => {
  try {
    const { employee_id, turnover_risk, motivation_level, performance_score, sick_days, notes } = req.body;
    if (!employee_id) return res.status(400).json({ error: "employee_id is required" });
    const data = await supabaseRequest("hr_risks", "POST", {
      body: {
        employee_id,
        turnover_risk: turnover_risk || "Low",
        motivation_level: motivation_level || 70,
        performance_score: performance_score || 75,
        sick_days: sick_days || 0,
        notes: notes || "",
      },
    });
    res.status(201).json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/hr-risks/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data: any[] = await supabaseRequest("hr_risks", "GET", {
      params: `?employee_id=eq.${employeeId}`,
    });
    if (!data.length) return res.status(404).json({ error: "HR risk not found" });
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/hr-risks/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { turnover_risk, motivation_level, performance_score, sick_days, notes } = req.body;
    const body: Record<string, unknown> = {};
    if (turnover_risk !== undefined) body.turnover_risk = turnover_risk;
    if (motivation_level !== undefined) body.motivation_level = motivation_level;
    if (performance_score !== undefined) body.performance_score = performance_score;
    if (sick_days !== undefined) body.sick_days = sick_days;
    if (notes !== undefined) body.notes = notes;
    body.updated_at = new Date().toISOString();

    await supabaseRequest("hr_risks", "PATCH", {
      params: `?employee_id=eq.${employeeId}`,
      body,
    });
    const updated = await supabaseRequest("hr_risks", "GET", {
      params: `?employee_id=eq.${employeeId}`,
    });
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Interventions
app.get("/api/interventions", async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let params = "?select=*,employees(name,department)";
    if (employee_id) params += `&employee_id=eq.${employee_id}`;
    if (status) params += `&status=eq.${status}`;
    params += "&order=created_at.desc";
    const data = await supabaseRequest("interventions", "GET", { params });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/interventions", async (req, res) => {
  try {
    const { employee_id, type, description, status } = req.body;
    if (!employee_id || !type || !description) return res.status(400).json({ error: "Missing required fields" });
    const data = await supabaseRequest("interventions", "POST", {
      body: { employee_id, type, description, status: status || "pending" },
    });
    res.status(201).json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [employees, companies, risks, assessments, interventions, deptBreakdown]: any[] = await Promise.all([
      supabaseRequest("employees", "GET", { params: "?select=id" }),
      supabaseRequest("companies", "GET", { params: "?select=id" }),
      supabaseRequest("hr_risks", "GET", { params: "?select=turnover_risk,motivation_level,performance_score,sick_days" }),
      supabaseRequest("clinical_assessments", "GET", { params: "?select=risk_score,risk_level" }),
      supabaseRequest("interventions", "GET", { params: "?select=status" }),
      supabaseRequest("employees", "GET", {
        params: "?select=department,hr_risks(motivation_level)&hr_risks.motivation_level=not.is.null"
      }),
    ]);

    const highRisk = risks.filter((r: any) => r.turnover_risk === "High" || r.turnover_risk === "Critical").length;
    const highAsmnt = assessments.filter((a: any) => a.risk_level === "High" || a.risk_level === "Critical").length;

    // Build department breakdown
    const deptMap: Record<string, { count: number; totalMot: number }> = {};
    for (const emp of deptBreakdown) {
      if (!deptMap[emp.department]) deptMap[emp.department] = { count: 0, totalMot: 0 };
      deptMap[emp.department].count++;
      deptMap[emp.department].totalMot += emp.hr_risks?.motivation_level || 0;
    }
    const departmentBreakdown = Object.entries(deptMap).map(([department, v]) => ({
      department,
      count: v.count,
      avgMotivation: Math.round(v.totalMot / v.count),
    }));

    res.json({
      totalEmployees: employees.length,
      totalCompanies: companies.length,
      riskStats: {
        total: risks.length,
        highRisk,
        avgMotivation: risks.length ? Math.round(risks.reduce((s: number, r: any) => s + (r.motivation_level || 0), 0) / risks.length) : 0,
        avgPerformance: risks.length ? Math.round(risks.reduce((s: number, r: any) => s + (r.performance_score || 0), 0) / risks.length) : 0,
        totalSickDays: risks.reduce((s: number, r: any) => s + (r.sick_days || 0), 0),
      },
      assessmentStats: {
        total: assessments.length,
        avgRiskScore: assessments.length ? Math.round(assessments.reduce((s: number, a: any) => s + (a.risk_score || 0), 0) / assessments.length) : 0,
        highRiskCount: highAsmnt,
      },
      interventionStats: {
        total: interventions.length,
        active: interventions.filter((i: any) => i.status === "active").length,
        completed: interventions.filter((i: any) => i.status === "completed").length,
        pending: interventions.filter((i: any) => i.status === "pending").length,
      },
      departmentBreakdown,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Speech Analysis (Gemini)
app.post("/api/analyze-speech", async (req, res) => {
  try {
    const { text_context } = req.body;
    if (!text_context) return res.status(400).json({ error: "text_context is required" });

    const ai = getGemini();
    const prompt = `Analyze the following employee voice feedback. Return ONLY valid JSON with these fields: transcription, sentiment (Positive/Neutral/Negative/Critical), toneIndex (1-100), keyThemes (array of 2-3 strings), suggestedIntervention (string). Text: ${text_context}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing speech:", error);
    res.status(500).json({ error: error.message || "Failed to analyze speech" });
  }
});

// Email/SMS
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) return res.status(400).json({ error: "Missing required fields" });
    const data = await getResend().emails.send({
      from: "HR Assessment <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
});

app.post("/api/send-sms", async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ error: "Missing required fields" });
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) throw new Error("TWILIO_PHONE_NUMBER required");
    const message = await getTwilio().messages.create({ body, from: fromNumber, to });
    res.json({ success: true, messageId: message.sid });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to send SMS" });
  }
});

// ─────────────────────────────────────────
// Start server
// ─────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    // Serve built static assets
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback — all non-API routes serve index.html
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development: Vite dev server with HMR
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HR ASSESSMENT] Server running on http://localhost:${PORT}`);
    console.log(`[HR ASSESSMENT] Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`[HR ASSESSMENT] Database: Supabase (vodhhauwowkalvaxzqyv)`);
  });
}

startServer();
