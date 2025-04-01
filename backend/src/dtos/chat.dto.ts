import { z } from 'zod';

// Schema for creating a new conversation
export const CreateConversationDto = z.object({
  title: z.string().optional(),
});

// Schema for creating a new message (content only since conversationId is in URL params)
export const CreateMessageDto = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

// Schema for getting conversation messages
export const GetConversationMessagesDto = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
});

// Types derived from the schemas
export type CreateConversationDtoType = z.infer<typeof CreateConversationDto>;

// For the message DTO, we need to define an extended type that includes conversationId
// as it's used in the service layer even though it's not part of the validation schema
export type CreateMessageDtoType = {
  content: string;
  conversationId: string;
};

export type GetConversationMessagesDtoType = z.infer<typeof GetConversationMessagesDto>;