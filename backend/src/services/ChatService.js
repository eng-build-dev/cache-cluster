const ChatMessage = require('../models/ChatMessage');

class ChatService {
  /**
   * Send a chat message
   */
  async sendMessage(senderName, message, senderType) {
    const chatMessage = new ChatMessage({
      senderName,
      message,
      senderType
    });

    await chatMessage.save();
    return chatMessage;
  }

  /**
   * Get recent chat messages
   */
  async getRecentMessages(limit = 50) {
    return await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .sort({ createdAt: 1 });
  }
}

module.exports = ChatService;


