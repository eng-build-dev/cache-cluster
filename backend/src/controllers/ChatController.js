const ChatService = require('../services/ChatService');

const chatService = new ChatService();

class ChatController {
  /**
   * Send a chat message
   */
  async sendMessage(req, res) {
    try {
      const { senderName, message, senderType } = req.body;

      if (!senderName || !message || !senderType) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!['teacher', 'student'].includes(senderType)) {
        res.status(400).json({ error: 'Invalid senderType' });
        return;
      }

      const chatMessage = await chatService.sendMessage(senderName, message, senderType);
      res.status(201).json(chatMessage);
    } catch (error) {
      console.error('Error sending chat message:', error);
      res.status(500).json({ error: error.message || 'Failed to send message' });
    }
  }

  /**
   * Get recent chat messages
   */
  async getRecentMessages(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const messages = await chatService.getRecentMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      res.status(500).json({ error: error.message || 'Failed to get messages' });
    }
  }
}

module.exports = new ChatController();


