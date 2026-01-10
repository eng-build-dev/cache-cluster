const express = require('express');
const router = express.Router();
const pollController = require('../controllers/PollController');

router.post('/create', (req, res) => pollController.createPoll(req, res));
router.get('/active', (req, res) => pollController.getActivePoll(req, res));
router.get('/history', (req, res) => pollController.getPollHistory(req, res));
router.get('/:pollId/results', (req, res) => pollController.getPollResults(req, res));
router.post('/vote', (req, res) => pollController.submitVote(req, res));

module.exports = router;




