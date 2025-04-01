import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { ApiError } from '../middleware/error.middleware';

/**
 * Service for interacting with the Google Gemini API
 * 
 * MODIFIED FOR TESTING: This implementation uses a mock response
 * instead of actually calling the Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-pro'; // Using gemini-pro model
  private useRealApi = false; // Set to true to use real API

  constructor() {
    // Check if API key is configured and we want to use the real API
    if (this.useRealApi) {
      if (!config.gemini.apiKey) {
        console.error('Gemini API key not found. Please set GEMINI_API_KEY in .env file.');
      } else {
        // Initialize the Google Generative AI client
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey || '');
        console.log('Using real Gemini API');
      }
    } else {
      console.log('Using mock Gemini API implementation');
    }
  }

  /**
   * Generate a response from the Gemini API
   * @param prompt The user's prompt
   * @param history Optional conversation history for context
   */
  async generateResponse(prompt: string, history?: Array<{ role: string; content: string }>) {
    try {
      console.log(`Received prompt: "${prompt}"`);
      
      // Use mock implementation for testing
      if (!this.useRealApi || !this.genAI) {
        console.log('Using mock response');
        // Wait a moment to simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate a mock response based on the prompt
        return this.generateMockResponse(prompt);
      }
      
      // Real API implementation (when useRealApi is true)
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
      console.error('Error in generateResponse:', error);
      
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
  
  /**
   * Generate a mock response for testing purposes
   */
  private generateMockResponse(prompt: string): string {
    // Basic pattern matching for some common queries
    if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
      return "Hello! I'm a simplified mock version of the Gemini AI. How can I help you today?";
    }
    
    if (prompt.toLowerCase().includes('?')) {
      return `That's an interesting question about "${prompt.replace('?', '')}". As a mock AI, I would normally provide a thoughtful answer here based on my training data.`;
    }
    
    if (prompt.toLowerCase().includes('help')) {
      return "I'd be happy to help! Please let me know what specific information or assistance you need.";
    }
    
    // Default response
    return `I received your message: "${prompt}"\n\nIn a real implementation, I would generate a contextually relevant response based on your input and any conversation history. This is just a mock response for testing the chat interface.`;
  }
}

export default new GeminiService();