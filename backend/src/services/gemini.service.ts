import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { ApiError } from '../middleware/error.middleware';

/**
 * Service for interacting with the Google Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-2.0-flash-thinking-exp-01-21'; // Updated to use gemini-2.5-pro model
  private useRealApi = true; // Set to true to use real API

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
        console.error('Detailed error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('API key')) {
          throw new ApiError('Invalid API key or authorization error', 401);
        }
        if (error.message.includes('rate limit')) {
          throw new ApiError('Rate limit exceeded. Please try again later.', 429);
        }
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          throw new ApiError(`Model '${this.modelName}' not found. Please check the model name.`, 404);
        }
        if (error.message.includes('permission') || error.message.includes('access')) {
          throw new ApiError('Permission denied to access this model or resource', 403);
        }
      }
      
      // Generic error
      throw new ApiError('Failed to generate AI response: ' + (error instanceof Error ? error.message : 'Unknown error'), 500);
    }
  }
  
  /**
   * Generate a title for a conversation based on its content
   * @param messages The conversation messages
   */
  async generateConversationTitle(messages: Array<{ role: string; content: string }>) {
    try {
      if (messages.length < 2) {
        return "New Conversation"; // Not enough context yet
      }
      
      // Create a simple prompt for title generation
      const prompt = `Based on the following conversation, generate a short, descriptive title (max 6 words) that captures the main topic. Do not use quotes in the response. Only respond with the title text.

Conversation:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`).join('\n')}`;
      
      console.log("Generating title for conversation");
      
      // Use the real API if available
      if (this.useRealApi && this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const title = response.text().trim();
        
        // Ensure the title is not too long
        return title.length > 50 ? title.substring(0, 47) + "..." : title;
      }
      
      // Mock implementation for testing
      return "Generated Conversation Title";
    } catch (error) {
      console.error('Error generating conversation title:', error);
      return "New Conversation"; // Fallback title
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