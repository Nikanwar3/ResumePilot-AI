import { Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service';
import { profileRepository } from '../repositories/profile.repository';
import { AuthRequest } from '../types';
import { param } from '../utils/request.utils';

export class InterviewController {
  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.createSession(req.user!.id);
      res.status(201).json({ success: true, message: 'Interview session created', data: session });
    } catch (err) {
      next(err);
    }
  }

  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.getSession(param(req.params.sessionId), req.user!.id);
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  async getUserSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await interviewService.getUserSessions(req.user!.id);
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const result = await interviewService.sendMessage(param(req.params.sessionId), req.user!.id, message);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async extractProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const extracted = await interviewService.extractAndSaveProfile(param(req.params.sessionId), req.user!.id);

      const personal = (extracted as Record<string, unknown>).personalInfo as Record<string, unknown> || {};
      await profileRepository.upsert(req.user!.id, {
        phone: personal.phone as string,
        location: personal.location as string,
        linkedin: personal.linkedin as string,
        github: personal.github as string,
        targetRole: (extracted as Record<string, unknown>).targetRole as string,
      });

      res.json({ success: true, message: 'Profile extracted and saved', data: extracted });
    } catch (err) {
      next(err);
    }
  }

  async completeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.completeSession(param(req.params.sessionId), req.user!.id);
      res.json({ success: true, message: 'Interview completed', data: session });
    } catch (err) {
      next(err);
    }
  }
}

export const interviewController = new InterviewController();
