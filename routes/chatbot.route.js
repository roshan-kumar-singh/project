const express = require('express');
const router = express.Router();
const { chatbot } = require('../controllers/chatbot.controller.js');

router.post('/', chatbot);

module.exports = router;