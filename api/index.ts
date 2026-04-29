import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Risk profile endpoint
app.get("/api/risk-profile/:employeeId", (req, res) => {
  // In production, this queries the database
  res.json({ message: "Risk profile endpoint - connect to DB" });
});

// Clinical assessment endpoint
app.post("/api/clinical-assessment", (req, res) => {
  const assessment = req.body;
  // In production, this saves to database
  res.json({ success: true, id: `ca-${Date.now()}`, data: assessment });
});

// MSK Analysis endpoint (AI-powered)
app.post("/api/analyze-msk", async (req, res) => {
  const { regionData, workFactors } = req.body;
  // In production, this calls Gemini AI for analysis
  res.json({
    riskScore: Math.round(Math.random() * 40 + 30),
    riskLevel: "Moderate",
    summary: "AI-powered MSK analysis would be generated here with Gemini."
  });
});

export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
