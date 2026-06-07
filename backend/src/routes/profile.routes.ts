import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile.bind(profileController));
router.put('/', profileController.upsertProfile.bind(profileController));

router.post('/education', profileController.addEducation.bind(profileController));
router.put('/education/:id', profileController.updateEducation.bind(profileController));
router.delete('/education/:id', profileController.deleteEducation.bind(profileController));

router.put('/skills', profileController.replaceSkills.bind(profileController));

router.post('/experience', profileController.addExperience.bind(profileController));
router.put('/experience/:id', profileController.updateExperience.bind(profileController));
router.delete('/experience/:id', profileController.deleteExperience.bind(profileController));

router.post('/projects', profileController.addProject.bind(profileController));

router.post('/certifications', profileController.addCertification.bind(profileController));

router.post('/achievements', profileController.addAchievement.bind(profileController));

export default router;
