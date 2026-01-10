const StudentService = require('../services/StudentService');

const studentService = new StudentService();

class StudentController {
  /**
   * Register a student
   */
  async registerStudent(req, res) {
    try {
      const { name, sessionId } = req.body;

      if (!name || !sessionId) {
        res.status(400).json({ error: 'Name and sessionId are required' });
        return;
      }

      const student = await studentService.registerStudent(name, sessionId);
      res.status(201).json(student);
    } catch (error) {
      console.error('Error registering student:', error);
      res.status(500).json({ error: error.message || 'Failed to register student' });
    }
  }

  /**
   * Get all active students
   */
  async getActiveStudents(req, res) {
    try {
      const students = await studentService.getActiveStudents();
      res.json(students);
    } catch (error) {
      console.error('Error getting active students:', error);
      res.status(500).json({ error: error.message || 'Failed to get active students' });
    }
  }

  /**
   * Remove a student
   */
  async removeStudent(req, res) {
    try {
      const { sessionId } = req.params;
      const success = await studentService.removeStudent(sessionId);
      
      if (!success) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing student:', error);
      res.status(500).json({ error: error.message || 'Failed to remove student' });
    }
  }
}

module.exports = new StudentController();




