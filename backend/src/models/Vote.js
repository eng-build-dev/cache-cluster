const mongoose = require('mongoose');
const { Schema } = mongoose;

const VoteSchema = new Schema({
  pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
  studentName: { type: String, required: true },
  optionIndex: { type: Number, required: true },
  sessionId: { type: String, required: true }
}, {
  timestamps: true
});

// Prevent duplicate votes: one vote per poll per session
VoteSchema.index({ pollId: 1, sessionId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;




