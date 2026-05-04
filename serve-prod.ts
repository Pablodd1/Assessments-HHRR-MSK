import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());

// ─── Serve static build ───
app.use(express.static(path.join(__dirname, "dist")));

// ─── Supabase ───
const SUPABASE_URL = "https://vodhhauwowkalvaxzqyv.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

async function supabaseRequest(
  table: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  options: { params?: string; body?: Record<string, unknown>; id?: string | number } = {}
) {
  const { params, body, id } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (id !== undefined) url += `?id=eq.${id}`;
  else if (params) url += params;

  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers["Prefer"] = "return=representation";
  }

  const fetchOptions: RequestInit = { method, headers };
  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    fetchOptions.body = JSON.stringify(body);
  }

  const resp = await fetch(url, fetchOptions);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.message || `Supabase error ${resp.status}`);
  return data;
}

// ─── API Routes ───
app.get("/api/health", (_req, res) => res.json({ status: "ok", mode: "production" }));

app.get("/api/companies", async (_req, res) => {
  try { res.json(await supabaseRequest("companies", "GET", { params: "?select=*&order=name" })); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/employees", async (_req, res) => {
  try {
    const employees: any[] = await supabaseRequest("employees", "GET", {
      params: "?select=*,companies(name,industry,size)&order=name",
    });
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
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/hr-risks", async (_req, res) => {
  try {
    res.json(await supabaseRequest("hr_risks", "GET", {
      params: "?select=*,employees(name,department,position,email)&order=turnover_risk,employee_id",
    }));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/hr-risks/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const body: Record<string, unknown> = { ...req.body, updated_at: new Date().toISOString() };
    await supabaseRequest("hr_risks", "PATCH", { params: `?employee_id=eq.${employeeId}`, body });
    const updated = await supabaseRequest("hr_risks", "GET", { params: `?employee_id=eq.${employeeId}` });
    res.json(updated[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/interventions", async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let params = "?select=*,employees(name,department)";
    if (employee_id) params += `&employee_id=eq.${employee_id}`;
    if (status) params += `&status=eq.${status}`;
    params += "&order=created_at.desc";
    res.json(await supabaseRequest("interventions", "GET", { params }));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/interventions", async (req, res) => {
  try {
    const { employee_id, type, description, status } = req.body;
    if (!employee_id || !type || !description) return res.status(400).json({ error: "Missing required fields" });
    const data = await supabaseRequest("interventions", "POST", {
      body: { employee_id, type, description, status: status || "pending" },
    });
    res.status(201).json(data[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/dashboard/stats", async (_req, res) => {
  try {
    const [employees, companies, risks, assessments, interventions]: any[] = await Promise.all([
      supabaseRequest("employees", "GET", { params: "?select=id" }),
      supabaseRequest("companies", "GET", { params: "?select=id" }),
      supabaseRequest("hr_risks", "GET", { params: "?select=turnover_risk,motivation_level,performance_score,sick_days" }),
      supabaseRequest("clinical_assessments", "GET", { params: "?select=risk_score,risk_level" }),
      supabaseRequest("interventions", "GET", { params: "?select=status" }),
    ]);
    const highRisk = risks.filter((r: any) => r.turnover_risk === "High" || r.turnover_risk === "Critical").length;
    res.json({
      totalEmployees: employees.length,
      totalCompanies: companies.length,
      riskStats: {
        total: risks.length, highRisk,
        avgMotivation: risks.length ? Math.round(risks.reduce((s: number, r: any) => s + (r.motivation_level || 0), 0) / risks.length) : 0,
        avgPerformance: risks.length ? Math.round(risks.reduce((s: number, r: any) => s + (r.performance_score || 0), 0) / risks.length) : 0,
        totalSickDays: risks.reduce((s: number, r: any) => s + (r.sick_days || 0), 0),
      },
      assessmentStats: {
        total: assessments.length,
        avgRiskScore: assessments.length ? Math.round(assessments.reduce((s: number, a: any) => s + (a.risk_score || 0), 0) / assessments.length) : 0,
        highRiskCount: assessments.filter((a: any) => a.risk_level === "High" || a.risk_level === "Critical").length,
      },
      interventionStats: {
        total: interventions.length,
        active: interventions.filter((i: any) => i.status === "active").length,
        completed: interventions.filter((i: any) => i.status === "completed").length,
        pending: interventions.filter((i: any) => i.status === "pending").length,
      },
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/analyze-speech", async (req, res) => {
  try {
    const { text_context } = req.body;
    if (!text_context) return res.status(400).json({ error: "text_context is required" });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const prompt = `Analyze the following employee voice feedback. Return ONLY valid JSON with these fields: transcription, sentiment (Positive/Neutral/Negative/Critical), toneIndex (1-100), keyThemes (array of 2-3 strings), suggestedIntervention (string). Text: ${text_context}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── SPA fallback — must be last ───
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[HR ASSESSMENT] Production server on http://localhost:${PORT}`);
});
