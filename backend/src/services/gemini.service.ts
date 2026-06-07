import { generateContent, generateStructuredContent } from '../config/gemini';
import { InterviewMessage, ParsedJobDescription, ResumeContent } from '../types';

export class GeminiService {
  async generateInterviewQuestion(
    phase: string,
    collectedData: Record<string, unknown>,
    messages: InterviewMessage[]
  ): Promise<{ question: string; followUps: string[]; isComplete: boolean }> {
    const conversationHistory = messages
      .slice(-6)
      .map((m) => `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`)
      .join('\n');

    const prompt = `You are ResumePilot AI, a professional career coach conducting a friendly resume interview.

Current phase: ${phase}
Data collected so far: ${JSON.stringify(collectedData, null, 2)}
Recent conversation:
${conversationHistory}

Your task: Generate the next most appropriate interview question for the "${phase}" phase.

Rules:
1. Ask ONE focused question at a time
2. Be conversational and encouraging
3. Ask follow-up questions when user mentions experiences (e.g., if they mention MERN internship, ask about duration, technologies, features built, APIs, auth, deployment)
4. Extract specific quantifiable details (duration, team size, metrics, impact)
5. Mark isComplete=true only when you have sufficient data for this phase
6. Never fabricate or suggest fake experiences

Respond in this exact JSON format:
{
  "question": "Your friendly interview question here",
  "followUps": ["possible follow-up 1", "possible follow-up 2"],
  "isComplete": false
}`;

    return generateStructuredContent(prompt, JSON.parse);
  }

  async generateDynamicFollowUp(
    userAnswer: string,
    context: string
  ): Promise<string> {
    const prompt = `You are a professional resume interview coach.

User just said: "${userAnswer}"
Context: ${context}

Generate ONE specific follow-up question to extract more professional details.
The question should help get quantifiable, ATS-friendly information.
Return ONLY the question text, nothing else.`;

    return generateContent(prompt);
  }

  async analyzeJobDescription(jobDescription: string): Promise<ParsedJobDescription> {
    const prompt = `Analyze this job description and extract structured information.

Job Description:
${jobDescription}

Extract and return ONLY valid JSON with this exact structure:
{
  "title": "job title",
  "company": "company name or null",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "roleType": "full-time/contract/etc",
  "experienceLevel": "X years or entry/mid/senior",
  "educationRequired": "degree requirement or null"
}

Include ALL technical skills, tools, frameworks, and domain keywords.
Separate required from preferred based on language used (must/required vs preferred/nice-to-have).`;

    return generateStructuredContent(prompt, JSON.parse);
  }

  async generateProfessionalSummary(
    profile: Record<string, unknown>,
    targetRole: string,
    jobKeywords?: string[]
  ): Promise<string> {
    const prompt = `You are an expert resume writer. Write a professional summary for an ATS-optimized resume.

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Target Role: ${targetRole}
${jobKeywords ? `Key terms to include: ${jobKeywords.slice(0, 10).join(', ')}` : ''}

Rules:
1. Write 3-4 compelling sentences
2. Use only information provided in the profile - NEVER fabricate
3. Start with years of experience and specialization
4. Include 2-3 key technical strengths
5. End with value proposition
6. Use present tense, active voice
7. Include relevant keywords naturally
8. Do NOT use first person (I, my, me)

Return ONLY the summary text, no quotes or extra formatting.`;

    return generateContent(prompt);
  }

  async improveBulletPoints(
    bullets: string[],
    role: string,
    company: string
  ): Promise<string[]> {
    const prompt = `Improve these resume bullet points for a ${role} position at ${company}.

Original bullets:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Rules:
1. Start each bullet with a strong action verb (Developed, Implemented, Optimized, Led, Built, Reduced, Improved)
2. Add quantifiable metrics where possible (percentages, numbers, scale)
3. Use only information provided - do NOT invent metrics or achievements
4. Keep each bullet to 1-2 lines max
5. Use technical keywords relevant to software engineering
6. Focus on impact and outcomes

Return ONLY the improved bullets as a JSON array of strings:
["bullet 1", "bullet 2", "bullet 3"]`;

    return generateStructuredContent(prompt, JSON.parse);
  }

  async generateSkillsSection(
    rawSkills: string[],
    targetRole: string
  ): Promise<Array<{ category: string; skills: string[] }>> {
    const prompt = `Organize these skills into categories for a ${targetRole} resume.

Skills: ${rawSkills.join(', ')}

Categorize into: Programming Languages, Frameworks & Libraries, Databases, Cloud & DevOps, Tools & Technologies
Only include skills actually listed above.

Return ONLY valid JSON:
[
  {"category": "Programming Languages", "skills": ["skill1", "skill2"]},
  {"category": "Frameworks & Libraries", "skills": ["skill1", "skill2"]}
]`;

    return generateStructuredContent(prompt, JSON.parse);
  }

  async generateProjectHighlights(
    project: { name: string; description: string; technologies: string[] }
  ): Promise<string[]> {
    const prompt = `Generate 3 ATS-friendly resume bullet points for this project:

Project: ${project.name}
Description: ${project.description}
Technologies: ${project.technologies.join(', ')}

Rules:
1. Start each with an action verb
2. Use only the information provided - never invent features
3. Highlight technical implementation and technologies used
4. Be specific and professional

Return ONLY a JSON array of strings:
["highlight 1", "highlight 2", "highlight 3"]`;

    return generateStructuredContent(prompt, JSON.parse);
  }

  async extractProfileFromInterview(
    messages: InterviewMessage[]
  ): Promise<Record<string, unknown>> {
    const conversation = messages
      .map((m) => `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`)
      .join('\n');

    const prompt = `Extract structured profile data from this interview conversation.

Conversation:
${conversation}

Extract ALL information provided by the user and return as JSON:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  },
  "education": [{
    "degree": "",
    "field": "",
    "university": "",
    "startYear": 0,
    "endYear": 0,
    "gpa": null
  }],
  "skills": ["skill1", "skill2"],
  "experience": [{
    "company": "",
    "role": "",
    "type": "internship/full-time",
    "startDate": "",
    "endDate": "",
    "current": false,
    "description": ["bullet 1", "bullet 2"],
    "technologies": ["tech1", "tech2"]
  }],
  "projects": [{
    "name": "",
    "description": "",
    "technologies": ["tech1"],
    "highlights": ["feature 1", "feature 2"]
  }],
  "certifications": [],
  "achievements": [],
  "targetRole": ""
}

IMPORTANT: Only include information explicitly stated by the user. Do not infer or fabricate.`;

    return generateStructuredContent(prompt, JSON.parse);
  }
}

export const geminiService = new GeminiService();
