/**
 * Gemini AI Service logic
 * 
 * This service leverages the Google Gemini API to perform various intelligent tasks:
 * 1. analyzePatientIntake: Maps raw patient data to psychological segments and lead scores.
 * 2. generateCommunications: Creates personalized multi-day sequences (Email/SMS).
 * 3. generateSubjectLine: Crafting engaging subjects for generated emails.
 * 4. generateSpeech: Multimodal TTS for patient accessibility.
 * 
 * SCALE TIP: To scale, consider streaming responses for better UX during long generations
 * and caching results in a database (e.g. Firestore) to avoid redundant API calls.
 */
import { GoogleGenAI, Modality } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getGenAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });
  }
  return aiInstance;
};

/**
 * Generates an audio stream (base64) from text using Gemini's multimodal capabilities.
 * Used for appointment confirmations and accessibility.
 * @param text - The text to convert to speech
 * @returns Base64 encoded string of the resulting mp3
 */
export async function generateSpeech(text: string) {
  const ai = getGenAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/wav' });
      return URL.createObjectURL(audioBlob);
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

/**
 * Analyzes patient responses to categorize them and suggest follow-up tracks.
 * Uses gemini-3.1-pro-preview for deep intent analysis.
 */
export async function analyzePatientIntake(patientData: any) {
  const ai = getGenAI();
  const prompt = `
    Analyze the following patient intake data for a wellness clinic.
    Name: ${patientData.firstName} ${patientData.lastName}
    Interest: ${patientData.interest}
    Lifestyle Info: ${patientData.lifestyle || 'Not provided'}
    Voice Intake/Symptoms: ${patientData.voiceNotes || 'Not provided'}
    Contact Method: ${patientData.contactMethod}
    Best Time: ${patientData.bestTime}

    Generate a JSON response with the following fields:
    - segment: (string) A detailed patient segment based on their input (e.g., "High-Performance Athlete Seeking Recovery", "Stressed Executive Seeking Energy").
    - leadScore: (number 1-10) An estimated lead score based on completeness and interest.
    - intent: (string) "High", "Medium", or "Low".
    - suggestedFollowUp: (string) A specific recommended follow-up track based on their segment (e.g., "Send 'Executive Energy Protocol' Email Sequence + Invite to 'Stress Management' Webinar + SMS Scheduling Prompt").
    - internalSummary: (string) A short internal summary for the clinician. MUST NOT contain medical diagnosis, treatment recommendations, or disease claims. Use phrases like "interested in support for...", "educational content recommended", "no diagnosis inferred".
    - keyGoals: (array of strings) 2-3 specific wellness goals identified from the intake.
    - recommendedResources: (array of strings) 1-2 suggested educational resources or articles to send.
    
    Use the Voice Intake/Symptoms to understand the patient's concerns better, but do not diagnose.

    Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing patient intake:", error);
    return null;
  }
}

/**
 * Analyzes audio/speech data (passed as base64 or text for transcription/sentiment)
 * to extract key themes and emotional resonance.
 */
export async function analyzeSpeech(audioData?: string, textContext?: string) {
  const ai = getGenAI();
  const prompt = `
    Analyze the following employee voice feedback.
    ${textContext ? `Transcription/Text: ${textContext}` : 'Analyze the provided speech content.'}

    Generate a JSON response with:
    - transcription: (string) The full transcribed text.
    - sentiment: (string) "Positive", "Neutral", "Negative", or "Critical".
    - toneIndex: (number 1-100) A numerical score for positive resonance.
    - keyThemes: (array of strings) 2-3 main concerns or positives identified.
    - suggestedIntervention: (string) A short specific HR recommendation based on the voice tone and content.
    
    Make it professional and objective.
    Return ONLY valid JSON.
  `;

  try {
    const contents: any = [{ parts: [{ text: prompt }] }];
    
    if (audioData) {
      contents[0].parts.push({
        inlineData: {
          mimeType: "audio/wav",
          data: audioData
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing speech:", error);
    return null;
  }
}

export async function generateSubjectLine(patientData: any, emailType?: string, emailBody?: string) {
  const ai = getGenAI();
  const contextInstruction = emailType && emailBody
    ? `\nEmail Context:\nType: ${emailType}\nContent Snippet: ${emailBody.substring(0, 500)}...\nGenerate a subject line specifically for THIS email.`
    : `\nGenerate a subject line for a wellness clinic welcome email.`;

  const prompt = `
    Generate a short, catchy, and personalized email subject line for a wellness clinic email.
    Patient Name: ${patientData.firstName}
    Patient Interest: ${patientData.interest}
    AI Analysis Summary: ${patientData.aiSummary || 'Not provided'}
    ${contextInstruction}
    
    Make it engaging but professional, and avoid making medical claims. Return ONLY the subject line text, no quotes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });

    return response.text?.replace(/^"|"$/g, '').trim() || "Your Personalized Wellness Journey";
  } catch (error) {
    console.error("Error generating subject line:", error);
    return "Your Personalized Wellness Journey";
  }
}

/**
 * Generates a 3-day multi-channel communication sequence.
 * @param patientData - Patient context for personalization
 * @returns An object containing mapped email and SMS sequences
 */
export async function generateCommunications(patientData: any) {
  const ai = getGenAI();
  const prompt = `
    Generate a short, compliant welcome email sequence and one SMS for a wellness clinic patient.
    Name: ${patientData.firstName}
    Interest: ${patientData.interest}
    Patient Concerns/Symptoms: ${patientData.voiceNotes || 'Not provided'}

    Do NOT use medical claims, diagnosis, or treatment language.
    Include a scheduling CTA in all emails and the SMS.
    Include an opt-out message in the SMS.
    
    The emails should acknowledge the patient's interest/concerns without making medical claims.
    
    Return a JSON object with:
    - emails: Array of 5 objects, each with:
        - subject: (string)
        - body: (string, use HTML formatting like <p> and <br>)
        - day: (number, e.g., 1, 3, 7, 14, 21)
        - type: (Welcome Email, What To Expect, Wellness Education, FAQ / Objections, Invitation To Schedule)
    - sms: Array of 3 objects, each with:
        - type: (Welcome SMS, Reminder SMS, Follow-up SMS)
        - body: (string)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating communications:", error);
    return null;
  }
}
