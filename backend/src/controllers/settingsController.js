const pool = require('../db/index');

// Get chatbot config for logged in organization
const getConfig = async (req, res) => {
    const { organizationId } = req.user;

    try {
        const config = await pool.query(
            'SELECT * FROM chatbot_configs WHERE organization_id = $1',
            [organizationId]
        );

        const org = await pool.query(
            'SELECT name, phone, industry FROM organizations WHERE id = $1',
            [organizationId]
        );

        res.json({
            config: config.rows[0],
            organization: org.rows[0]
        });

    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Update chatbot config
const updateConfig = async (req, res) => {
    const { organizationId } = req.user;
    const { greetingMessage, questions, whatsappPhone } = req.body;

    try {
        // Update chatbot config
        await pool.query(
            `UPDATE chatbot_configs 
       SET greeting_message = $1, questions = $2
       WHERE organization_id = $3`,
            [greetingMessage, JSON.stringify(questions), organizationId]
        );

        // Update organization WhatsApp phone if provided
        if (whatsappPhone) {
            await pool.query(
                'UPDATE organizations SET phone = $1 WHERE id = $2',
                [whatsappPhone, organizationId]
            );
        }

        res.json({ message: 'Settings updated successfully' });

    } catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

module.exports = { getConfig, updateConfig };