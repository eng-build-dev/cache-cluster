const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

router.post('/send', (req, res) => chatController.sendMessage(req, res));
router.get('/messages', (req, res) => chatController.getRecentMessages(req, res));

module.exports = router;




