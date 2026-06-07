import { Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service';
import { geminiService } from '../services/gemini.service';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { param } from '../utils/request.utils';

export class ResumeController {
  async generateResume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, template, jobDescriptionId, targetRole } = req.body;

      let jobDescription;
      if (jobDescriptionId) {
        const jd = await prisma.jobDescription.findFirst({
          where: { id: jobDescriptionId, userId: req.user!.id },
        });
        if (jd) {
          jobDescription = {
            title: jd.title,
            company: jd.company ?? undefined,
            requiredSkills: jd.requiredSkills,
            preferredSkills: jd.preferredSkills,
            keywords: jd.keywords,
            roleType: jd.roleType ?? undefined,
            experienceLevel: jd.experience ?? undefined,
            educationRequired: jd.education ?? undefined,
          };
        }
      }

      const resume = await resumeService.generateResume(req.user!.id, {
        title,
        template: template || 'software-engineer',
        jobDescription,
        targetRole,
      });

      res.status(201).json({ success: true, message: 'Resume generated successfully', data: resume });
    } catch (err) {
      next(err);
    }
  }

  async getResume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getResume(param(req.params.id), req.user!.id);
      res.json({ success: true, data: resume });
    } catch (err) {
      next(err);
    }
  }

  async getPublicResume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getPublicResume(param(req.params.slug));
      res.json({ success: true, data: resume });
    } catch (err) {
      next(err);
    }
  }

  async getUserResumes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resumes = await resumeService.getUserResumes(req.user!.id);
      res.json({ success: true, data: resumes });
    } catch (err) {
      next(err);
    }
  }

  async updateResume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.updateResume(param(req.params.id), req.user!.id, req.body);
      res.json({ success: true, message: 'Resume updated', data: resume });
    } catch (err) {
      next(err);
    }
  }

  async deleteResume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await resumeService.deleteResume(param(req.params.id), req.user!.id);
      res.json({ success: true, message: 'Resume deleted' });
    } catch (err) {
      next(err);
    }
  }

  async analyzeATS(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobDescriptionText, jobDescriptionId } = req.body;

      let jobDescription;
      if (jobDescriptionId) {
        const jd = await prisma.jobDescription.findFirst({
          where: { id: jobDescriptionId, userId: req.user!.id },
        });
        if (jd) {
          jobDescription = {
            title: jd.title, requiredSkills: jd.requiredSkills,
            preferredSkills: jd.preferredSkills, keywords: jd.keywords,
            experienceLevel: jd.experience ?? undefined, educationRequired: jd.education ?? undefined,
          };
        }
      } else if (jobDescriptionText) {
        jobDescription = await geminiService.analyzeJobDescription(jobDescriptionText);
      }

      if (!jobDescription) {
        res.status(400).json({ success: false, message: 'Job description required for ATS analysis' });
        return;
      }

      const score = await resumeService.analyzeATSScore(param(req.params.id), req.user!.id, jobDescription);
      res.json({ success: true, data: score });
    } catch (err) {
      next(err);
    }
  }

  async createVersion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title } = req.body;
      const resume = await resumeService.createVersion(param(req.params.id), req.user!.id, title);
      res.status(201).json({ success: true, message: 'Version created', data: resume });
    } catch (err) {
      next(err);
    }
  }

  async analyzeJobDescription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content, title, company } = req.body;
      const parsed = await geminiService.analyzeJobDescription(content);

      const jd = await prisma.jobDescription.create({
        data: {
          userId: req.user!.id,
          title: title || parsed.title,
          company: company || parsed.company,
          content,
          requiredSkills: parsed.requiredSkills,
          preferredSkills: parsed.preferredSkills,
          keywords: parsed.keywords,
          roleType: parsed.roleType,
          experience: parsed.experienceLevel,
          education: parsed.educationRequired,
        },
      });

      res.status(201).json({ success: true, message: 'Job description analyzed', data: { jd, parsed } });
    } catch (err) {
      next(err);
    }
  }

  async getUserJobDescriptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jds = await prisma.jobDescription.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: jds });
    } catch (err) {
      next(err);
    }
  }
}

export const resumeController = new ResumeController();
