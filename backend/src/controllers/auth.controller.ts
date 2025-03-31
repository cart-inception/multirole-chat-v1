import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { SignupDtoType, LoginDtoType } from '../dtos/auth.dto';

/**
 * Controller for authentication endpoints
 */
export class AuthController {
  /**
   * Register a new user
   */
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: SignupDtoType = req.body;
      const result = await authService.signup(userData);
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials: LoginDtoType = req.body;
      const result = await authService.login(credentials);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get the current user's profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // User ID is available from the auth middleware
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const profile = await authService.getUserProfile(req.user.id);
      
      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();