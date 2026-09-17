import "server-only";
import { GoogleGenAI, ApiError, type Schema } from "@google/genai";
import { env } from "@/src/lib/env";

export type AiErrorCode = "quota" | "parse" | "unavailable";

export class AiError extends Error {
  constructor(readonly code: AiErrorCode, message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AiError";
  }
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return client;
}

export interface GenerateJsonOptions {
  prompt: string;
  system: string;
  schema: Schema;
  maxOutputTokens?: number;
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new SyntaxError("No JSON object in response");
    return JSON.parse(match[0]);
  }
}

/**
 * Call Gemini in JSON mode at temperature 0, constrained to `schema`.
 * Retries once on malformed output; maps quota/availability failures to typed errors.
 */
export async function generateJson({ prompt, system, schema, maxOutputTokens = 8192 }: GenerateJsonOptions): Promise<unknown> {
  const attempt = async () => {
    const res = await getClient().models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: system,
        temperature: 0,
        maxOutputTokens,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const text = res.text;
    if (!text) throw new SyntaxError("Empty response");
    return extractJson(text);
  };

  for (let i = 0; i < 2; i++) {
    try {
      return await attempt();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) throw new AiError("quota", "The AI service is busy right now.", err);
        if (err.status >= 500) throw new AiError("unavailable", "The AI service is temporarily unavailable.", err);
        throw new AiError("unavailable", `AI request failed (${err.status}).`, err);
      }
      if (err instanceof SyntaxError && i === 0) continue;
      if (err instanceof SyntaxError) throw new AiError("parse", "The AI returned an unreadable answer.", err);
      throw new AiError("unavailable", "Could not reach the AI service.", err);
    }
  }
  throw new AiError("parse", "The AI returned an unreadable answer.");
}
