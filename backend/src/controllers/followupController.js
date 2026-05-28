const pool = require('../db/index');
const axios = require('axios');
require('dotenv').config();

// ── Send WhatsApp message (reused from webhook) ──
const sendWhatsAppMessage = async (to, message) => {
    try {
        await axios.post(
            `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: message }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return true;
    } catch (error) {
        console.error('Error sending follow-up WhatsApp:', error.response?.data);
        return false;
    }
};

// ── Replace template variables ──
const buildMessage = (template, lead) => {
    const requirements = lead.requirements || {};
    return template
        .replace(/{name}/g, lead.name || 'there')
        .replace(/{area}/g, requirements.area || 'your preferred area')
        .replace(/{budget}/g, requirements.budget || 'your budget')
        .replace(/{bhk}/g, requirements.bhk || 'your preferred BHK')
        .replace(/{phone}/g, lead.phone || '');
};

// ── Get follow-up settings ──
const getFollowupSettings = async (req, res) => {
    const { organizationId } = req.user;
    try {
        let result = await pool.query(
            'SELECT * FROM followup_settings WHERE organization_id = $1',
            [organizationId]
        );

        // Create default settings if none exist
        if (result.rows.length === 0) {
            result = await pool.query(
                `INSERT INTO followup_settings (organization_id) VALUES ($1) RETURNING *`,
                [organizationId]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get followup settings error:', error);
        res.status(500).json({ error: 'Failed to get follow-up settings' });
    }
};

// ── Update follow-up settings ──
const updateFollowupSettings = async (req, res) => {
    const { organizationId } = req.user;
    const { is_enabled, sequences } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO followup_settings (organization_id, is_enabled, sequences)
             VALUES ($1, $2, $3)
             ON CONFLICT (organization_id)
             DO UPDATE SET is_enabled = $2, sequences = $3, updated_at = NOW()
             RETURNING *`,
            [organizationId, is_enabled, JSON.stringify(sequences)]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update followup settings error:', error);
        res.status(500).json({ error: 'Failed to update follow-up settings' });
    }
};

// ── Main follow-up job — run this every hour ──
const processFollowups = async () => {
    console.log('Running follow-up job...');
    try {
        // Get all orgs with follow-ups enabled
        const orgs = await pool.query(
            `SELECT fs.*, o.name as org_name, o.phone as org_phone
             FROM followup_settings fs
             JOIN organizations o ON o.id = fs.organization_id
             WHERE fs.is_enabled = true`
        );

        for (const org of orgs.rows) {
            const sequences = org.sequences;
            if (!sequences || sequences.length === 0) continue;

            for (const sequence of sequences) {
                if (!sequence.enabled) continue;

                const dayNumber = sequence.day;
                const hoursAgo = dayNumber * 24;

                // Find leads that:
                // 1. Belong to this org
                // 2. Were created hoursAgo hours ago (within a 1-hour window)
                // 3. Haven't received this follow-up yet
                // 4. Are not converted or lost
                const leads = await pool.query(
                    `SELECT l.* FROM leads l
                     WHERE l.organization_id = $1
                     AND l.status NOT IN ('converted', 'lost')
                     AND l.created_at <= NOW() - INTERVAL '${hoursAgo} hours'
                     AND l.created_at > NOW() - INTERVAL '${hoursAgo + 1} hours'
                     AND NOT EXISTS (
                         SELECT 1 FROM followup_logs fl
                         WHERE fl.lead_id = l.id
                         AND fl.day_number = $2
                     )`,
                    [org.organization_id, dayNumber]
                );

                for (const lead of leads.rows) {
                    const message = buildMessage(sequence.message, lead);
                    const sent = await sendWhatsAppMessage(lead.whatsapp_number, message);

                    if (sent) {
                        // Log the follow-up
                        await pool.query(
                            `INSERT INTO followup_logs (organization_id, lead_id, day_number, message_sent)
                             VALUES ($1, $2, $3, $4)
                             ON CONFLICT (lead_id, day_number) DO NOTHING`,
                            [org.organization_id, lead.id, dayNumber, message]
                        );
                        console.log(`Follow-up day ${dayNumber} sent to ${lead.name} (${lead.phone})`);

                        if (org.org_phone) {
                            await sendWhatsAppMessage(org.org_phone,
                                `📅 Follow-up Sent — Day ${dayNumber}\n\n` +
                                `👤 Lead: ${lead.name}\n` +
                                `📱 Phone: +${lead.phone}\n` +
                                `💬 Message: "${message}"\n\n` +
                                `View dashboard: https://ourivo.com/dashboard`
                            );
                        }
                    }
                }
            }
        }
        console.log('Follow-up job complete');
    } catch (error) {
        console.error('Follow-up job error:', error);
    }
};

module.exports = { getFollowupSettings, updateFollowupSettings, processFollowups };