import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { ApiError } from '../middleware/error.middleware';

/**
 * Service for interacting with the Google Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-pro'; // Using gemini-pro model

  constructor() {
    // Check if API key is configured
    if (!config.gemini.apiKey) {
      console.error('Gemini API key not found. Please set GEMINI_API_KEY in .env file.');
    }
    
    // Initialize the Google Generative AI client
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey || '');
  }

  /**
   * Generate a response from the Gemini API
   * @param prompt The user's prompt
   * @param history Optional conversation history for context
   */
  async generateResponse(prompt: string, history?: Array<{ role: string; content: string }>) {
    try {
      // Get the model instance
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      // Configure the chat session
      const chat = model.startChat({
        history: history?.map(entry => ({
          role: entry.role as 'user' | 'model',
          parts: [{ text: entry.content }],
        })) || [],
      });
      
      // Send the user's prompt and get a response
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Handle specific API errors (extend as needed)
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new ApiError('Invalid API key or authorization error', 401);
        }
        if (error.message.includes('rate limit')) {
          throw new ApiError('Rate limit exceeded. Please try again later.', 429);
        }
      }
      
      // Generic error
      throw new ApiError('Failed to generate AI response', 500);
    }
  }
}

export default new GeminiService();