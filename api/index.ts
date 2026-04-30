import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, apikey, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const reqPath = (req.url || "/").split("?")[0];
  const parts = reqPath.split("/").filter(Boolean); // ['api', 'route', ...]
  const route = parts[1] || "";
  const id = parts[2] || "";

  // ─── HEALTH ────────────────────────────────────────────
  if (route === "health") {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString(), service: "HR Risk Assessment API" });
    return;
  }

  // ─── COMPANIES ─────────────────────────────────────────
  if (route === "companies") {
    if (req.method === "GET") {
      res.status(200).json([
        { id: 1, name: "Acme Corp", industry: "Manufacturing", size: 250 },
        { id: 2, name: "TechFlow Inc", industry: "Technology", size: 85 },
        { id: 3, name: "Miami Health Systems", industry: "Healthcare", size: 420 },
      ]);
      return;
    }
    if (req.method === "POST") {
      const { name, industry, size } = req.body || {};
      res.status(201).json({ id: Date.now(), name, industry, size, message: "Created (mock)" });
      return;
    }
  }

  // ─── EMPLOYEES ──────────────────────────────────────────
  if (route === "employees") {
    if (req.method === "GET") {
      if (id) {
        res.status(200).json({
          id,
          name: "Sarah Chen",
          email: "sarah.chen@acmecorp.com",
          department: "Engineering",
          position: "Senior Developer",
          role: "Staff",
          company_name: "Acme Corp",
          company_industry: "Manufacturing",
          company_size: 250,
          hire_date: "2022-03-15",
          hrRisk: { turnover_risk: "Low", motivation_level: 82, performance_score: 88, sick_days: 2 },
          clinicalAssessments: [],
          interventions: [],
        });
        return;
      }
      res.status(200).json([
        { id: "1", name: "Sarah Chen", email: "sarah.chen@acmecorp.com", department: "Engineering", position: "Senior Dev", company_name: "Acme Corp", hrRisk: { turnover_risk: "Low" } },
        { id: "2", name: "Marcus Johnson", email: "marcus.j@techflow.io", department: "Sales", position: "Account Exec", company_name: "TechFlow Inc", hrRisk: { turnover_risk: "Medium" } },
        { id: "3", name: "Dr. Ana Rodriguez", email: "ana.r@miamihealth.org", department: "Clinical", position: "Physician", company_name: "Miami Health Systems", hrRisk: { turnover_risk: "Low" } },
      ]);
      return;
    }
    if (req.method === "POST") {
      const { name, email, department, position } = req.body || {};
      res.status(201).json({ id: Date.now(), name, email, department, position, message: "Created (mock)" });
      return;
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      res.status(200).json({ message: "Updated (mock)" });
      return;
    }
  }

  // ─── CLINICAL ASSESSMENTS ──────────────────────────────
  if (route === "clinical-assessments") {
    if (req.method === "GET") {
      res.status(200).json([
        { id: 1, employee_id: "1", type: "MSK", risk_score: 35, risk_level: "Low", created_at: new Date().toISOString() },
        { id: 2, employee_id: "2", type: "MSK", risk_score: 68, risk_level: "Moderate", created_at: new Date().toISOString() },
      ]);
      return;
    }
    if (req.method === "POST") {
      const { employee_id, type, data_json, risk_score, risk_level } = req.body || {};
      res.status(201).json({
        id: Date.now(),
        employee_id,
        type,
        risk_score: risk_score || 50,
        risk_level: risk_level || "Moderate",
        data_json,
        created_at: new Date().toISOString(),
      });
      return;
    }
  }

  // ─── ANALYZE MSK ────────────────────────────────────────
  if (route === "analyze-msk") {
    const body = req.body || {};
    const { region, painLevel, symptoms, duration } = body;

    const riskScore = Math.round((painLevel || 5) * 7 + Math.random() * 15);
    const riskLevel = riskScore < 40 ? "Low" : riskScore < 65 ? "Moderate" : riskScore < 80 ? "High" : "Critical";

    const recommendations = [
      "Ergonomic workstation assessment recommended",
      "Regular stretching breaks every 45 minutes",
      "Physical therapy consultation",
      "MSK health coaching session",
      "Follow-up assessment in 4 weeks",
    ];

    res.status(200).json({
      riskScore,
      riskLevel,
      region: region || "unknown",
      summary: `AI-powered MSK analysis for ${region} region. Pain level ${painLevel}/10, duration ${duration}.`,
      recommendations: recommendations.slice(0, 3),
      followUpDays: riskLevel === "Critical" ? 3 : riskLevel === "High" ? 7 : riskLevel === "Moderate" ? 14 : 30,
    });
    return;
  }

  // ─── HR RISKS ───────────────────────────────────────────
  if (route === "hr-risks") {
    if (req.method === "GET") {
      if (id) {
        res.status(200).json({ employee_id: id, turnover_risk: "Low", motivation_level: 75, performance_score: 80, sick_days: 3 });
        return;
      }
      res.status(200).json([
        { id: 1, employee_id: "1", turnover_risk: "Low", motivation_level: 82, performance_score: 88, sick_days: 2 },
        { id: 2, employee_id: "2", turnover_risk: "Medium", motivation_level: 60, performance_score: 72, sick_days: 8 },
        { id: 3, employee_id: "3", turnover_risk: "Low", motivation_level: 90, performance_score: 95, sick_days: 0 },
      ]);
      return;
    }
    if (req.method === "POST") {
      const { employee_id, turnover_risk, motivation_level, performance_score, sick_days } = req.body || {};
      res.status(201).json({ id: Date.now(), employee_id, turnover_risk, motivation_level, performance_score, sick_days });
      return;
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      res.status(200).json({ message: "Updated (mock)" });
      return;
    }
  }

  // ─── INTERVENTIONS ──────────────────────────────────────
  if (route === "interventions") {
    if (req.method === "GET") {
      res.status(200).json([
        { id: 1, employee_id: "1", type: "Wellness", description: "Ergonomic desk setup", status: "active" },
        { id: 2, employee_id: "2", type: "Coaching", description: "Career development plan", status: "pending" },
      ]);
      return;
    }
    if (req.method === "POST") {
      const { employee_id, type, description, status } = req.body || {};
      res.status(201).json({ id: Date.now(), employee_id, type, description, status: status || "pending" });
      return;
    }
  }

  // ─── ANALYZE SPEECH ─────────────────────────────────────
  if (route === "analyze-speech") {
    const { text_context } = req.body || {};
    const sentiment = text_context
      ? text_context.toLowerCase().includes("great") || text_context.toLowerCase().includes("love") || text_context.toLowerCase().includes("happy")
        ? "Positive"
        : text_context.toLowerCase().includes("frustrated") || text_context.toLowerCase().includes("stress") || text_context.toLowerCase().includes("burned")
        ? "Negative"
        : "Neutral"
      : "Neutral";

    res.status(200).json({
      sentiment,
      toneIndex: sentiment === "Positive" ? 82 : sentiment === "Negative" ? 35 : 58,
      keyThemes: ["workload", "team dynamics"],
      suggestedIntervention: sentiment === "Negative" ? "Manager 1-on-1 scheduled" : "Continue monitoring",
      transcription: text_context || "",
    });
    return;
  }

  // ─── SEND EMAIL ─────────────────────────────────────────
  if (route === "send-email") {
    const { to, subject } = req.body || {};
    res.status(200).json({ success: true, messageId: `mock-${Date.now()}`, to, subject });
    return;
  }

  // ─── SEND SMS ───────────────────────────────────────────
  if (route === "send-sms") {
    const { to, body } = req.body || {};
    res.status(200).json({ success: true, messageId: `mock-sms-${Date.now()}`, to });
    return;
  }

  // ─── DASHBOARD STATS ─────────────────────────────────────
  if (route === "dashboard" && id === "stats") {
    res.status(200).json({
      totalEmployees: 47,
      totalCompanies: 3,
      riskStats: { total: 47, highRisk: 8, avgMotivation: 71, avgPerformance: 76, totalSickDays: 124 },
      assessmentStats: { total: 89, avgRiskScore: 42, highRiskCount: 12 },
      interventionStats: { total: 34, active: 18, completed: 12, pending: 4 },
      departmentBreakdown: [
        { department: "Engineering", count: 15, avgMotivation: 78 },
        { department: "Sales", count: 12, avgMotivation: 65 },
        { department: "Clinical", count: 20, avgMotivation: 85 },
      ],
    });
    return;
  }

  // ─── 404 FALLBACK ───────────────────────────────────────
  res.status(404).json({ error: "NOT_FOUND", path: reqPath, method: req.method, hint: "Check api/index.ts for available routes" });
}
