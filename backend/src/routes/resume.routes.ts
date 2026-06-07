import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { exportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/public/:slug', resumeController.getPublicResume.bind(resumeController));

// Protected routes
router.use(authenticate);

router.post('/generate', resumeController.generateResume.bind(resumeController));
router.get('/', resumeController.getUserResumes.bind(resumeController));
router.get('/:id', resumeController.getResume.bind(resumeController));
router.put('/:id', resumeController.updateResume.bind(resumeController));
router.delete('/:id', resumeController.deleteResume.bind(resumeController));
router.post('/:id/ats', resumeController.analyzeATS.bind(resumeController));
router.post('/:id/version', resumeController.createVersion.bind(resumeController));

// Export
router.get('/:id/export/pdf', exportController.exportPDF.bind(exportController));
router.get('/:id/export/docx', exportController.exportDOCX.bind(exportController));

// Job Descriptions
router.post('/jd/analyze', resumeController.analyzeJobDescription.bind(resumeController));
router.get('/jd/list', resumeController.getUserJobDescriptions.bind(resumeController));

export default router;
