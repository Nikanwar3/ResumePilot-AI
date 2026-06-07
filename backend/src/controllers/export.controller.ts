import { Response, NextFunction } from 'express';
import { exportService } from '../services/export.service';
import { resumeRepository } from '../repositories/resume.repository';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { ResumeContent } from '../types';
import { param } from '../utils/request.utils';

export class ExportController {
  async exportPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeRepository.findById(param(req.params.id));
      if (!resume) throw new AppError(404, 'Resume not found');

      if (resume.userId !== req.user!.id && !resume.isPublic) {
        throw new AppError(403, 'Access denied');
      }

      const content = resume.content as unknown as ResumeContent;
      const pdfBuffer = await exportService.generatePDF(content);

      await resumeRepository.incrementDownloads(resume.id);

      const fileName = `${content.personalInfo.name.replace(/\s+/g, '-')}-Resume.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  async exportDOCX(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeRepository.findById(param(req.params.id));
      if (!resume) throw new AppError(404, 'Resume not found');

      if (resume.userId !== req.user!.id && !resume.isPublic) {
        throw new AppError(403, 'Access denied');
      }

      const content = resume.content as unknown as ResumeContent;
      const docxBuffer = await exportService.generateDOCX(content);

      await resumeRepository.incrementDownloads(resume.id);

      const fileName = `${content.personalInfo.name.replace(/\s+/g, '-')}-Resume.docx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(docxBuffer);
    } catch (err) {
      next(err);
    }
  }
}

export const exportController = new ExportController();
