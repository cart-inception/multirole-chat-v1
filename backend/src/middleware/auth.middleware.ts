import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// Extend Express Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username?: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT tokens and attach user data to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing or invalid authentication token',
      });
    }
    
    // Get token from header (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing authentication token',
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      username?: string;
      email?: string;
    };
    
    // Attach user data to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };
    
    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired',
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'An error occurred while authenticating',
    });
  }
};

export default authMiddleware;