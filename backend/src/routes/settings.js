const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getConfig, updateConfig } = require('../controllers/settingsController');

router.get('/', authenticateToken, getConfig);
router.put('/', authenticateToken, updateConfig);

module.exports = router;