const pool = require('../db/index');

// Get all leads for an organization
const getLeads = async (req, res) => {
    const { organizationId } = req.user;

    try {
        const result = await pool.query(
            `SELECT * FROM leads 
       WHERE organization_id = $1 
       ORDER BY created_at DESC`,
            [organizationId]
        );

        res.json({
            leads: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

// Get single lead with full conversation
const getLeadById = async (req, res) => {
    const { organizationId } = req.user;
    const { id } = req.params;

    try {
        const lead = await pool.query(
            `SELECT * FROM leads 
       WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );

        if (lead.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const conversations = await pool.query(
            `SELECT * FROM conversations 
       WHERE lead_id = $1 
       ORDER BY created_at ASC`,
            [id]
        );

        res.json({
            lead: lead.rows[0],
            conversations: conversations.rows
        });

    } catch (error) {
        console.error('Get lead error:', error);
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
};

// Create a new lead manually
const createLead = async (req, res) => {
    const { organizationId } = req.user;
    const { name, phone, message, requirements, source } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO leads 
       (organization_id, name, phone, whatsapp_number, message, requirements, source)
       VALUES ($1, $2, $3, $3, $4, $5, $6)
       RETURNING *`,
            [
                organizationId,
                name,
                phone,
                message,
                JSON.stringify(requirements || {}),
                source || 'manual'
            ]
        );

        res.status(201).json({
            message: 'Lead created successfully',
            lead: result.rows[0]
        });

    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'contacted', 'qualified', 'site_visit', 'converted', 'lost'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }

    try {
        const result = await pool.query(
            `UPDATE leads 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3
       RETURNING *`,
            [status, id, organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json({
            message: 'Lead status updated',
            lead: result.rows[0]
        });

    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
};

// Delete a lead
const deleteLead = async (req, res) => {
    const { organizationId } = req.user;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM leads 
       WHERE id = $1 AND organization_id = $2
       RETURNING id`,
            [id, organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json({ message: 'Lead deleted successfully' });

    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
};

module.exports = {
    getLeads,
    getLeadById,
    createLead,
    updateLeadStatus,
    deleteLead
};