import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/error.middleware';
import config from '../config';
import { SignupDtoType, LoginDtoType } from '../dtos/auth.dto';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Service class for authentication-related operations
 */
export class AuthService {
  /**
   * Register a new user
   */
  async signup(userData: SignupDtoType) {
    // Check if user already exists with the same email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUserByEmail) {
      throw new ApiError('Email already in use', 400);
    }

    // Check if user already exists with the same username
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUserByUsername) {
      throw new ApiError('Username already taken', 400);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.username, user.email);

    // Return user data (excluding password hash) and token
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticate a user and generate a JWT token
   */
  async login(credentials: LoginDtoType) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new ApiError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.username, user.email);

    // Return user data (excluding password hash) and token
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Generate a JWT token for a user
   */
  private generateToken(userId: string, username: string, email: string) {
    return jwt.sign(
      { id: userId, username, email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return user;
  }
}

export default new AuthService();