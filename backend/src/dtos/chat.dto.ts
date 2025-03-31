import { z } from 'zod';

// Schema for creating a new conversation
export const CreateConversationDto = z.object({
  title: z.string().optional(),
});

// Schema for creating a new message
export const CreateMessageDto = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

// Schema for getting conversation messages
export const GetConversationMessagesDto = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
});

// Types derived from the schemas
export type CreateConversationDtoType = z.infer<typeof CreateConversationDto>;
export type CreateMessageDtoType = z.infer<typeof CreateMessageDto>;
export type GetConversationMessagesDtoType = z.infer<typeof GetConversationMessagesDto>;