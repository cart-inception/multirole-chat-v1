import { Router } from 'express';
import authController from '../controllers/auth.controller';
import validateRequest from '../middleware/validate.middleware';
import { SignupDto, LoginDto } from '../dtos/auth.dto';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/signup - Register a new user
router.post('/signup', validateRequest(SignupDto), authController.signup);

// POST /api/auth/login - Login a user
router.post('/login', validateRequest(LoginDto), authController.login);

// GET /api/auth/profile - Get the current user's profile
router.get('/profile', authMiddleware, authController.getProfile);

export default router;