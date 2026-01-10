const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatMessageSchema = new Schema({
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  senderType: { type: String, enum: ['teacher', 'student'], required: true }
}, {
  timestamps: true
});

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;


