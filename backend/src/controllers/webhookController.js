const pool = require('../db/index');
const axios = require('axios');
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Verify webhook ──
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

// ── Send email notification ──
const sendEmailNotification = async (toEmail, orgName, contactName, phone, messageText) => {
    try {
        await resend.emails.send({
            from: 'WhatsApp CRM <onboarding@resend.dev>',
            to: toEmail,
            subject: `🔔 New Lead: ${contactName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0F1115; color: #F5F7FA; padding: 32px; border-radius: 12px;">
                    <div style="background: #4F8CFF; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                        <span style="color: white; font-weight: 700; font-size: 16px;">W</span>
                    </div>
                    <h2 style="color: #F5F7FA; margin: 0 0 8px 0; font-size: 20px;">New Lead Captured</h2>
                    <p style="color: #9AA4B2; margin: 0 0 24px 0; font-size: 14px;">A new lead just came in via WhatsApp for ${orgName}.</p>
                    
                    <div style="background: #161A22; border: 1px solid #2A3142; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                        <div style="margin-bottom: 12px;">
                            <span style="color: #5C6A7E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Name</span>
                            <div style="color: #F5F7FA; font-size: 15px; font-weight: 600; margin-top: 4px;">${contactName}</div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <span style="color: #5C6A7E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Phone</span>
                            <div style="color: #F5F7FA; font-size: 15px; font-weight: 600; margin-top: 4px;">+${phone}</div>
                        </div>
                        <div>
                            <span style="color: #5C6A7E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">First Message</span>
                            <div style="color: #9AA4B2; font-size: 14px; margin-top: 4px; font-style: italic;">"${messageText}"</div>
                        </div>
                    </div>

                    <a href="https://saas-mvp-one.vercel.app/dashboard" 
                       style="display: block; background: #4F8CFF; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        View Lead in Dashboard →
                    </a>

                    <p style="color: #5C6A7E; font-size: 11px; text-align: center; margin-top: 24px;">
                        WhatsApp CRM · You are receiving this because you have notifications enabled.
                    </p>
                </div>
            `
        });
        console.log(`Email notification sent to ${toEmail}`);
    } catch (error) {
        console.error('Email notification error:', error);
    }
};

// ── Get or create lead ──
const getOrCreateLead = async (organizationId, phone, name) => {
    const existing = await pool.query(
        'SELECT * FROM leads WHERE organization_id = $1 AND phone = $2',
        [organizationId, phone]
    );

    if (existing.rows.length > 0) {
        return { lead: existing.rows[0], isNew: false };
    }

    const result = await pool.query(
        `INSERT INTO leads (organization_id, name, phone, whatsapp_number, status, source)
     VALUES ($1, $2, $3, $3, 'new', 'whatsapp')
     RETURNING *`,
        [organizationId, name || 'WhatsApp Lead', phone]
    );

    return { lead: result.rows[0], isNew: true };
};

// ── Save message ──
const saveMessage = async (organizationId, leadId, message, sender) => {
    await pool.query(
        `INSERT INTO conversations (organization_id, lead_id, message, sender)
     VALUES ($1, $2, $3, $4)`,
        [organizationId, leadId, message, sender]
    );
};

// ── Get chatbot config ──
const getChatbotConfig = async (organizationId) => {
    const result = await pool.query(
        'SELECT * FROM chatbot_configs WHERE organization_id = $1',
        [organizationId]
    );
    return result.rows[0];
};

// ── AI response logic ──
const getAIResponse = async (userMessage, lead, config) => {
    try {
        const questions = config?.questions || [];
        const requirements = lead.requirements || {};
        const answeredKeys = Object.keys(requirements);
        const nextQuestion = questions.find(q => !answeredKeys.includes(q.key));

        if (!nextQuestion) {
            return `Thank you! I have captured all your details. Our team will contact you shortly at ${lead.phone}. Have a great day!`;
        }

        if (answeredKeys.length === 0) {
            const greeting = config?.greeting_message || 'Hello! How can I help you today?';
            return `${greeting}\n\n${nextQuestion.question}`;
        }

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

        if (body.object !== 'whatsapp_business_account') {
            return res.sendStatus(404);
        }

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (!messages || messages.length === 0) {
            return res.sendStatus(200);
        }

        const message = messages[0];
        const from = message.from;
        const messageText = message.text?.body;
        const contactName = value?.contacts?.[0]?.profile?.name || 'WhatsApp Lead';

        console.log(`Message from ${from}: ${messageText}`);

        // Match org by WhatsApp Phone Number ID from metadata
        const incomingPhoneNumberId = value?.metadata?.phone_number_id;
        console.log(`Incoming message to phone_number_id: ${incomingPhoneNumberId}`);

        let orgResult;

        if (incomingPhoneNumberId && incomingPhoneNumberId === process.env.WHATSAPP_PHONE_NUMBER_ID) {
            orgResult = await pool.query(
                'SELECT id, phone, email, name FROM organizations ORDER BY created_at ASC LIMIT 1'
            );
        } else {
            orgResult = await pool.query(
                'SELECT id, phone, email, name FROM organizations ORDER BY created_at ASC LIMIT 1'
            );
        }

        console.log(`Routing to org: ${orgResult.rows[0]?.id}`);

        if (orgResult.rows.length === 0) {
            return res.sendStatus(200);
        }

        const organizationId = orgResult.rows[0].id;
        const ownerPhone = orgResult.rows[0].phone;
        const ownerEmail = orgResult.rows[0].email;
        const orgName = orgResult.rows[0].name;

        // Get or create lead
        const { lead, isNew } = await getOrCreateLead(organizationId, from, contactName);

        // Save incoming message
        await saveMessage(organizationId, lead.id, messageText, 'customer');

        // Generate and send bot response
        const config = await getChatbotConfig(organizationId);
        const response = await getAIResponse(messageText, lead, config);
        await saveMessage(organizationId, lead.id, response, 'bot');
        await sendWhatsAppMessage(from, response);

        // Send notifications for NEW leads only
        if (isNew) {
            const notificationMessage =
                `🔔 New Lead Captured!\n\n` +
                `👤 Name: ${contactName}\n` +
                `📱 Phone: +${from}\n` +
                `💬 Message: "${messageText}"\n\n` +
                `View dashboard: https://saas-mvp-one.vercel.app/dashboard`;

            // WhatsApp notification
            if (ownerPhone) {
                await sendWhatsAppMessage(ownerPhone, notificationMessage);
                console.log(`WhatsApp notification sent to ${ownerPhone}`);
            }

            // Email notification
            if (ownerEmail) {
                await sendEmailNotification(ownerEmail, orgName, contactName, from, messageText);
            }
        }

        console.log(`Response sent to ${from}: ${response}`);
        res.sendStatus(200);

    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};

module.exports = { verify, handleMessage };