const express = require('express');
const router = express.Router();
const { getFollowupSettings, updateFollowupSettings } = require('../controllers/followupController');
const authenticateToken = require('../middleware/auth');

router.get('/settings', authenticateToken, getFollowupSettings);
router.put('/settings', authenticateToken, updateFollowupSettings);

module.exports = router;