import { Response, NextFunction } from 'express';
import { profileRepository } from '../repositories/profile.repository';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/error.middleware';
import { param } from '../utils/request.utils';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async upsertProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.upsert(req.user!.id, req.body);
      res.json({ success: true, message: 'Profile updated', data: profile });
    } catch (err) {
      next(err);
    }
  }

  async addEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      if (!profile) throw new AppError(404, 'Profile not found');
      const edu = await profileRepository.addEducation(profile.id, req.body);
      res.status(201).json({ success: true, message: 'Education added', data: edu });
    } catch (err) {
      next(err);
    }
  }

  async updateEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const edu = await profileRepository.updateEducation(param(req.params.id), req.body);
      res.json({ success: true, message: 'Education updated', data: edu });
    } catch (err) {
      next(err);
    }
  }

  async deleteEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await profileRepository.deleteEducation(param(req.params.id));
      res.json({ success: true, message: 'Education deleted' });
    } catch (err) {
      next(err);
    }
  }

  async replaceSkills(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      if (!profile) throw new AppError(404, 'Profile not found');
      await profileRepository.replaceSkills(profile.id, req.body.skills);
      res.json({ success: true, message: 'Skills updated' });
    } catch (err) {
      next(err);
    }
  }

  async addExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      if (!profile) throw new AppError(404, 'Profile not found');
      const exp = await profileRepository.addExperience(profile.id, {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });
      res.status(201).json({ success: true, message: 'Experience added', data: exp });
    } catch (err) {
      next(err);
    }
  }

  async updateExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exp = await profileRepository.updateExperience(param(req.params.id), req.body);
      res.json({ success: true, message: 'Experience updated', data: exp });
    } catch (err) {
      next(err);
    }
  }

  async deleteExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await profileRepository.deleteExperience(param(req.params.id));
      res.json({ success: true, message: 'Experience deleted' });
    } catch (err) {
      next(err);
    }
  }

  async addProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      if (!profile) throw new AppError(404, 'Profile not found');
      const proj = await profileRepository.addProject(profile.id, req.body);
      res.status(201).json({ success: true, message: 'Project added', data: proj });
    } catch (err) {
      next(err);
    }
  }

  async addCertification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      if (!profile) throw new AppError(404, 'Profile not found');
      const cert = await profileRepository.addCertification(profile.id, req.body);
      res.status(201).json({ success: true, message: 'Certification added', data: cert });
    } catch (err) {
      next(err);
    }
  }

  async addAchievement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileRepository.findByUserId(req.user!.id);
      if (!profile) throw new AppError(404, 'Profile not found');
      const ach = await profileRepository.addAchievement(profile.id, req.body);
      res.status(201).json({ success: true, message: 'Achievement added', data: ach });
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();
