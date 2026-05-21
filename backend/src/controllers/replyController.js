const pool = require('../db/index');
const axios = require('axios');
require('dotenv').config();

const replyToLead = async (req, res) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message cannot be empty' });
    }

    try {
        // Get lead and verify it belongs to this org
        const leadResult = await pool.query(
            'SELECT * FROM leads WHERE id = $1 AND organization_id = $2',
            [id, organizationId]
        );

        if (leadResult.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const lead = leadResult.rows[0];
        const to = lead.whatsapp_number || lead.phone;

        // Send WhatsApp message
        await axios.post(
            `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: message.trim() }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Save message to conversation history
        await pool.query(
            `INSERT INTO conversations (organization_id, lead_id, message, sender)
             VALUES ($1, $2, $3, 'agent')`,
            [organizationId, id, message.trim()]
        );

        res.json({ success: true, message: 'Message sent' });

    } catch (error) {
        console.error('Reply error:', error.response?.data || error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

module.exports = { replyToLead };