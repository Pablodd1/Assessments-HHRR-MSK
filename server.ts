import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const resend = getResend();
    
    const data = await resend.emails.send({
      from: "Clinic Demo <onboarding@resend.dev>", // Use a verified domain in production
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
