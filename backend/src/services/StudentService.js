const Student = require('../models/Student');

class StudentService {
  /**
   * Register a new student
   */
  async registerStudent(name, sessionId) {
    // Check if student with this sessionId already exists
    let student = await Student.findOne({ sessionId });
    
    if (student) {
      // Update existing student
      student.name = name;
      student.isActive = true;
      await student.save();
      return student;
    }

    // Create new student
    student = new Student({
      name,
      sessionId,
      isActive: true
    });

    await student.save();
    return student;
  }

  /**
   * Get all active students
   */
  async getActiveStudents() {
    return await Student.find({ isActive: true }).sort({ joinedAt: -1 });
  }

  /**
   * Remove a student (kick out)
   */
  async removeStudent(sessionId) {
    const student = await Student.findOne({ sessionId });
    if (!student) {
      return false;
    }

    student.isActive = false;
    await student.save();
    return true;
  }

  /**
   * Get student by sessionId
   */
  async getStudentBySessionId(sessionId) {
    return await Student.findOne({ sessionId, isActive: true });
  }
}

module.exports = StudentService;


