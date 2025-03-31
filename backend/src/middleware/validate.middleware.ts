import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Middleware creator for validating request bodies against Zod schemas
export const validateRequest = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against provided schema
      const validatedData = schema.parse(req.body);
      
      // Replace request body with validated data
      req.body = validatedData;
      
      // Continue to the next middleware or controller
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during validation',
      });
    }
  };
};

export default validateRequest;