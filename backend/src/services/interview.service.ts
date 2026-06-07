import { prisma } from '../config/database';
import { geminiService } from './gemini.service';
import { InterviewMessage } from '../types';
import { AppError } from '../middleware/error.middleware';

const PHASE_ORDER = [
  'personal',
  'education',
  'skills',
  'experience',
  'projects',
  'certifications',
  'achievements',
  'target',
] as const;

type Phase = typeof PHASE_ORDER[number];

const PHASE_WELCOME_MESSAGES: Record<Phase, string> = {
  personal: "Hi! I'm ResumePilot AI. I'll help you build an outstanding resume through a friendly conversation. Let's start with the basics — what's your full name?",
  education: "Great! Now let's talk about your educational background. What's your highest degree?",
  skills: "Excellent! Let's capture your technical skills. What programming languages are you proficient in?",
  experience: "Now let's discuss your work experience. Have you done any internships or worked professionally?",
  projects: "Let's talk about your projects — these really showcase your abilities! Tell me about your most impactful project.",
  certifications: "Do you have any certifications or courses you've completed? (e.g., AWS, Google Cloud, Coursera courses)",
  achievements: "Have you received any awards, won hackathons, or had notable accomplishments?",
  target: "Almost done! What's your target role — the type of position you're applying for?",
};

export class InterviewService {
  async createSession(userId: string) {
    const existing = await prisma.interviewSession.findFirst({
      where: { userId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) return existing;

    const welcomeMessage: InterviewMessage = {
      role: 'assistant',
      content: PHASE_WELCOME_MESSAGES.personal,
      timestamp: new Date().toISOString(),
    };

    return prisma.interviewSession.create({
      data: {
        userId,
        messages: [welcomeMessage] as unknown as import('@prisma/client').Prisma.InputJsonValue,
        status: 'active',
        phase: 'personal',
        progress: 0,
      },
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw new AppError(404, 'Interview session not found');
    return session;
  }

  async getUserSessions(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async sendMessage(sessionId: string, userId: string, userMessage: string) {
    const session = await this.getSession(sessionId, userId);

    if (session.status === 'completed') {
      throw new AppError(400, 'This interview session is already completed');
    }

    const messages = (session.messages as unknown as InterviewMessage[]) || [];

    const userMsg: InterviewMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    messages.push(userMsg);

    const currentPhase = session.phase as Phase;
    const phaseIndex = PHASE_ORDER.indexOf(currentPhase);

    let collectedData: Record<string, unknown> = {};
    try {
      const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content);
      collectedData = { userResponses: userMessages, phase: currentPhase };
    } catch {
      collectedData = {};
    }

    const aiResponse = await geminiService.generateInterviewQuestion(
      currentPhase,
      collectedData,
      messages
    );

    let nextPhase = currentPhase;
    let progress = session.progress;
    let status: 'active' | 'completed' = 'active';

    if (aiResponse.isComplete && phaseIndex < PHASE_ORDER.length - 1) {
      nextPhase = PHASE_ORDER[phaseIndex + 1];
      progress = Math.round(((phaseIndex + 1) / PHASE_ORDER.length) * 100);

      const transitionMsg: InterviewMessage = {
        role: 'assistant',
        content: `${aiResponse.question}\n\n${PHASE_WELCOME_MESSAGES[nextPhase]}`,
        timestamp: new Date().toISOString(),
      };
      messages.push(transitionMsg);
    } else if (aiResponse.isComplete && phaseIndex === PHASE_ORDER.length - 1) {
      status = 'completed';
      progress = 100;

      const completionMsg: InterviewMessage = {
        role: 'assistant',
        content: "🎉 Excellent! I have everything I need to build your resume. Your profile is complete! You can now generate your professional, ATS-optimized resume.",
        timestamp: new Date().toISOString(),
      };
      messages.push(completionMsg);
    } else {
      const aiMsg: InterviewMessage = {
        role: 'assistant',
        content: aiResponse.question,
        timestamp: new Date().toISOString(),
      };
      messages.push(aiMsg);
    }

    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        messages: messages as unknown as import('@prisma/client').Prisma.InputJsonValue,
        phase: nextPhase,
        progress,
        status,
      },
    });

    return {
      session: updated,
      latestMessage: messages[messages.length - 1],
      phase: nextPhase,
      progress,
      isComplete: status === 'completed',
    };
  }

  async extractAndSaveProfile(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId, userId);
    const messages = session.messages as unknown as InterviewMessage[];

    const extractedData = await geminiService.extractProfileFromInterview(messages);
    return extractedData;
  }

  async completeSession(sessionId: string, userId: string) {
    await this.getSession(sessionId, userId);
    return prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'completed', progress: 100 },
    });
  }
}

export const interviewService = new InterviewService();
