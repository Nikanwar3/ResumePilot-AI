import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', validateBody(registerSchema), authController.register.bind(authController));
router.post('/login', validateBody(loginSchema), authController.login.bind(authController));
router.post('/google', authController.googleAuth.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
