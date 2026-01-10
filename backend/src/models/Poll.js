const mongoose = require('mongoose');
const { Schema } = mongoose;

const OptionSchema = new Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
  votes: { type: Number, default: 0 }
});

const PollSchema = new Schema({
  question: { type: String, required: true },
  options: [OptionSchema],
  duration: { type: Number, required: true, default: 60 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Poll = mongoose.model('Poll', PollSchema);

module.exports = Poll;


