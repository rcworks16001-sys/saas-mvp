const express = require('express');
const router = express.Router();
const { getProperties, updateProperty, deleteProperty } = require('../controllers/inventoryController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, getProperties);
router.patch('/:id', authenticateToken, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

module.exports = router;