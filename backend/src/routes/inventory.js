const express = require('express');
const router = express.Router();
const { getProperties, deleteProperty } = require('../controllers/inventoryController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, getProperties);
router.delete('/:id', authenticateToken, deleteProperty);

module.exports = router;