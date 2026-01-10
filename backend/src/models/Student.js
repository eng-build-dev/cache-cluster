const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema({
  name: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;


