const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');

router.post('/register', (req, res) => studentController.registerStudent(req, res));
router.get('/active', (req, res) => studentController.getActiveStudents(req, res));
router.delete('/:sessionId', (req, res) => studentController.removeStudent(req, res));

module.exports = router;




