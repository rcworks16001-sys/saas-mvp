const express = require('express');
const router = express.Router();
const { deleteAccount } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.delete('/delete-account', authenticateToken, deleteAccount);

module.exports = router;