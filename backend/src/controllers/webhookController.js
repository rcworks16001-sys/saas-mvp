const pool = require('../db/index');
const axios = require('axios');
require('dotenv').config();

// ── Verify webhook (Meta calls this once to confirm your endpoint) ──
const verify = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.status(403).send('Forbidden');
    }
};

// ── Send WhatsApp message ──
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
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data);
    }
};

// ── Get or create a lead from a WhatsApp number ──
const getOrCreateLead = async (organizationId, phone, name) => {
    // Check if lead already exists
    const existing = await pool.query(
        'SELECT * FROM leads WHERE organization_id = $1 AND phone = $2',
        [organizationId, phone]
    );

    if (existing.rows.length > 0) {
        return { lead: existing.rows[0], isNew: false };
    }

    // Create new lead
    const result = await pool.query(
        `INSERT INTO leads (organization_id, name, phone, whatsapp_number, status, source)
     VALUES ($1, $2, $3, $3, 'new', 'whatsapp')
     RETURNING *`,
        [organizationId, name || 'WhatsApp Lead', phone]
    );

    return { lead: result.rows[0], isNew: true };
};

// ── Save conversation message ──
const saveMessage = async (organizationId, leadId, message, sender) => {
    await pool.query(
        `INSERT INTO conversations (organization_id, lead_id, message, sender)
     VALUES ($1, $2, $3, $4)`,
        [organizationId, leadId, message, sender]
    );
};

// ── Get chatbot config for organization ──
const getChatbotConfig = async (organizationId) => {
    const result = await pool.query(
        'SELECT * FROM chatbot_configs WHERE organization_id = $1',
        [organizationId]
    );
    return result.rows[0];
};

// ── AI response using OpenAI ──
const getAIResponse = async (userMessage, lead, config) => {
    try {
        const questions = config?.questions || [];
        const requirements = lead.requirements || {};

        // Figure out which question to ask next
        const answeredKeys = Object.keys(requirements);
        const nextQuestion = questions.find(q => !answeredKeys.includes(q.key));

        // If all questions answered, give closing message
        if (!nextQuestion) {
            return `Thank you! I have captured all your details. Our team will contact you shortly at ${lead.phone}. Have a great day!`;
        }

        // If this is the first message, greet and ask first question
        if (answeredKeys.length === 0) {
            const greeting = config?.greeting_message || 'Hello! How can I help you today?';
            return `${greeting}\n\n${nextQuestion.question}`;
        }

        // Save the answer to the previous question
        const lastAskedKey = questions[answeredKeys.length - 1]?.key;
        if (lastAskedKey) {
            const updatedRequirements = { ...requirements, [lastAskedKey]: userMessage };
            await pool.query(
                'UPDATE leads SET requirements = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(updatedRequirements), lead.id]
            );
        }

        return nextQuestion.question;

    } catch (error) {
        console.error('AI response error:', error);
        return "Thank you for your message! Our team will get back to you shortly.";
    }
};

// ── Main message handler ──
const handleMessage = async (req, res) => {
    try {
        const body = req.body;

        // Confirm it's a WhatsApp message
        if (body.object !== 'whatsapp_business_account') {
            return res.sendStatus(404);
        }

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        // Only process if there are messages
        if (!messages || messages.length === 0) {
            return res.sendStatus(200);
        }

        const message = messages[0];
        const from = message.from; // Customer's WhatsApp number
        const messageText = message.text?.body;
        const contactName = value?.contacts?.[0]?.profile?.name || 'WhatsApp Lead';

        console.log(`Message from ${from}: ${messageText}`);

        // Find which organization this WhatsApp number belongs to
        // For MVP: use the first organization (later: map by phone number)
        const orgResult = await pool.query(
            'SELECT id FROM organizations LIMIT 1'
        );

        if (orgResult.rows.length === 0) {
            return res.sendStatus(200);
        }

        const organizationId = orgResult.rows[0].id;

        // Get or create lead
        const { lead, isNew } = await getOrCreateLead(organizationId, from, contactName);

        // Save incoming message
        await saveMessage(organizationId, lead.id, messageText, 'customer');

        // Get chatbot config
        const config = await getChatbotConfig(organizationId);

        // Generate response
        const response = await getAIResponse(messageText, lead, config);

        // Save bot response
        await saveMessage(organizationId, lead.id, response, 'bot');

        // Send response back to customer
        await sendWhatsAppMessage(from, response);

        console.log(`Response sent to ${from}: ${response}`);

        res.sendStatus(200);

    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};

module.exports = { verify, handleMessage };