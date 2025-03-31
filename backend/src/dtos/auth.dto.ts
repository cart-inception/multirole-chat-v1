import { z } from 'zod';

// Schema for user signup
export const SignupDto = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
});

// Schema for user login
export const LoginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string(),
});

// Types derived from the schemas
export type SignupDtoType = z.infer<typeof SignupDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;