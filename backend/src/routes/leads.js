const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
    getLeads,
    getLeadById,
    createLead,
    updateLeadStatus,
    deleteLead
} = require('../controllers/leadsController');
const { replyToLead } = require('../controllers/replyController');

// All routes protected by auth
router.get('/', authenticateToken, getLeads);
router.get('/:id', authenticateToken, getLeadById);
router.post('/', authenticateToken, createLead);
router.patch('/:id/status', authenticateToken, updateLeadStatus);
router.delete('/:id', authenticateToken, deleteLead);
router.post('/:id/reply', authenticateToken, replyToLead);

module.exports = router;