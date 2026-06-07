import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

export function getGeminiClient(): GenerativeModel {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

export async function generateContent(prompt: string): Promise<string> {
  const gemini = getGeminiClient();
  const result = await gemini.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateStructuredContent<T>(
  prompt: string,
  parseResponse: (text: string) => T
): Promise<T> {
  const text = await generateContent(prompt);
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return parseResponse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as structured data');
  }
}
