import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/sessions', interviewController.createSession.bind(interviewController));
router.get('/sessions', interviewController.getUserSessions.bind(interviewController));
router.get('/sessions/:sessionId', interviewController.getSession.bind(interviewController));
router.post('/sessions/:sessionId/message', interviewController.sendMessage.bind(interviewController));
router.post('/sessions/:sessionId/extract', interviewController.extractProfile.bind(interviewController));
router.post('/sessions/:sessionId/complete', interviewController.completeSession.bind(interviewController));

export default router;
