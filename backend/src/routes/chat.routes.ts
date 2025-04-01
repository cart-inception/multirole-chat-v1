import { Router } from 'express';
import chatController from '../controllers/chat.controller';
import authMiddleware from '../middleware/auth.middleware';
import validateRequest from '../middleware/validate.middleware';
import { CreateConversationDto, CreateMessageDto } from '../dtos/chat.dto';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new conversation
router.post('/conversations', validateRequest(CreateConversationDto), function(req, res, next) {
  chatController.createConversation(req, res, next);
});

// Get all conversations
router.get('/conversations', function(req, res, next) {
  chatController.getUserConversations(req, res, next);
});

// Get a conversation by ID
router.get('/conversations/:id', function(req, res, next) {
  chatController.getConversation(req, res, next);
});

// Delete a conversation
router.delete('/conversations/:id', function(req, res, next) {
  chatController.deleteConversation(req, res, next);
});

// Send a message to a conversation
router.post('/conversations/:id/messages', validateRequest(CreateMessageDto), function(req, res, next) {
  chatController.sendMessage(req, res, next);
});

// Generate a title for a conversation
router.post('/conversations/:id/generate-title', function(req, res, next) {
  chatController.generateConversationTitle(req, res, next);
});

export default router;