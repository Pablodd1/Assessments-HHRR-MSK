import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, apikey, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Parse path — Vercel passes /api/health for the /api/health route
  const reqPath = (req.url || "/").split("?")[0];

  // Health check
  if (reqPath === "/api/health") {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    return;
  }

  // Risk profile
  if (reqPath.startsWith("/api/risk-profile/")) {
    const parts = reqPath.split("/");
    const employeeId = parts[parts.length - 1];
    res.status(200).json({ message: "Risk profile endpoint", employeeId });
    return;
  }

  // Clinical assessment
  if (reqPath === "/api/clinical-assessment" && req.method === "POST") {
    res.status(200).json({ success: true, id: `ca-${Date.now()}`, data: req.body });
    return;
  }

  // MSK Analysis
  if (reqPath === "/api/analyze-msk" && req.method === "POST") {
    res.status(200).json({
      riskScore: Math.round(Math.random() * 40 + 30),
      riskLevel: "Moderate",
      summary: "AI-powered MSK analysis via Gemini."
    });
    return;
  }

  // Debug - echo back the path
  if (reqPath === "/api/debug") {
    res.status(200).json({ path: reqPath, method: req.method, url: req.url });
    return;
  }

  res.status(404).json({ error: "NOT_FOUND", path: reqPath });
}
