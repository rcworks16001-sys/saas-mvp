const pool = require('../db/index');
const { updateLeadScore } = require('./leadsController');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { handleInventoryMessage } = require('./inventoryController');
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
            from: 'Ourivo <noreply@ourivo.com>',
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

                    <a href="https://ourivo.com/dashboard" 
                       style="display: block; background: #4F8CFF; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        View Lead in Dashboard →
                    </a>

                    <p style="color: #5C6A7E; font-size: 11px; text-align: center; margin-top: 24px;">
                        Ourivo · You are receiving this because you have notifications enabled.
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
    if (!message || !String(message).trim()) return; // never insert null/empty
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

const getAIResponse = async (userMessage, lead, config, orgInfo) => {
    try {
        const questions = config?.questions || [];
        const coreKeys = questions.map(q => q.key); // ['name','rent_or_buy','bhk','area','budget']

        // Fetch fresh state
        const freshLead = await pool.query('SELECT * FROM leads WHERE id = $1', [lead.id]);
        const requirements = freshLead.rows[0]?.requirements || {};

        // Count conversations
        const convCount = await pool.query('SELECT COUNT(*) FROM conversations WHERE lead_id = $1', [lead.id]);
        const isFirstMessage = parseInt(convCount.rows[0].count) <= 1;

        // Phase flags
        const brochureSent = requirements._brochure_sent === true;
        const moveInAnswered = !!requirements._move_in_date;

        // ── PHASE 1a: First message — greet + ask name ──
        if (isFirstMessage) {
            const firstQuestion = questions[0]?.question || 'May I know your name?';
            return `${config?.greeting_message || 'Hello! Welcome! 😊'}\n\n${firstQuestion}`;
        }

        // ── PHASE 1b: Smart extraction using Claude Haiku ──
        if (!brochureSent) {
            const Anthropic = require('@anthropic-ai/sdk');
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

            const extractRes = await anthropic.messages.create({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 200,
                messages: [{
                    role: 'user',
                    content: `Extract real estate requirements from a WhatsApp message and update existing data.

Current requirements: ${JSON.stringify(requirements)}
Customer message: "${userMessage}"

Fields to extract:
- name: customer name only
- rent_or_buy: must be exactly "buy" or "rent"
- bhk: number only as string e.g. "3"
- area: locality name only e.g. "Velachery"
- budget: as stated e.g. "45 lakhs"

Rules:
- If customer corrects a previous answer (e.g. "sorry, I meant buy"), update that field
- "3bhk in Velachery" → bhk is "3" AND area is "Velachery"
- Only include fields clearly present in this message
- Do not overwrite existing fields unless customer is correcting them
- Return ONLY a valid JSON object, no markdown, no explanation`
                }]
            });

            try {
                const raw = extractRes.content[0].text.replace(/```json|```/g, '').trim();
                const extracted = JSON.parse(raw);

                // Lock the lead row, re-read FRESH requirements inside the transaction,
                // merge the AI-extracted fields onto that fresh copy, then write.
                // This prevents two concurrent messages from the same lead from each
                // saving onto a stale snapshot and silently dropping the other's fields.
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    const locked = await client.query(
                        'SELECT requirements FROM leads WHERE id = $1 FOR UPDATE',
                        [lead.id]
                    );
                    const freshReqs = locked.rows[0]?.requirements || {};
                    Object.assign(freshReqs, extracted);
                    await client.query(
                        'UPDATE leads SET requirements = $1, updated_at = NOW() WHERE id = $2',
                        [JSON.stringify(freshReqs), lead.id]
                    );
                    await client.query('COMMIT');
                    // Keep the in-memory copy used by the rest of this function in sync
                    // with what we just committed.
                    Object.keys(requirements).forEach(k => delete requirements[k]);
                    Object.assign(requirements, freshReqs);
                } catch (txErr) {
                    await client.query('ROLLBACK');
                    throw txErr;
                } finally {
                    client.release();
                }

                await updateLeadScore(lead.id);
            } catch (e) {
                console.error('[Extract] parse error:', e);
            }
        }

        // Recompute after save
        const updatedCoreAnswered = coreKeys.filter(k => requirements[k]);
        const allCoreAnswered = updatedCoreAnswered.length === coreKeys.length;
        const nextCoreQuestion = questions.find(q => !requirements[q.key]);

        // ── PHASE 1c: Ask next core question ──
        if (!allCoreAnswered && !brochureSent) {
            const ack = requirements.name ? `Got it, ${requirements.name}! 😊` : `Got it! 😊`;
            return `${ack} ${nextCoreQuestion.question}`;
        }

        // ── PHASE 2: All core questions answered → trigger brochure ──
        if (allCoreAnswered && !brochureSent) {
            const { matchProperties, generateAndSendBrochure } = require('./brochureController');
            const orgResult = await pool.query('SELECT * FROM organizations WHERE id = $1', [lead.organization_id]);
            const org = orgResult.rows[0];

            const { exactMatches, proximityMatches } = await matchProperties(requirements, lead.organization_id);
            const hasProperties = exactMatches.length + proximityMatches.length > 0;

            if (hasProperties) {
                generateAndSendBrochure(lead, requirements, exactMatches, proximityMatches, org)
                    .catch(e => console.error('[Brochure] generate error:', e));
            }

            requirements._brochure_sent = true;
            requirements._has_properties = hasProperties;
            await pool.query(
                'UPDATE leads SET requirements = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(requirements), lead.id]
            );

            const name = requirements.name || 'there';
            if (hasProperties) {
                return `Thank you, ${name}! 🏠 I've found some properties matching your requirements and I'm sending you a brochure right now!\n\nWhen are you looking to move in?`;
            } else {
                return `Thank you, ${name}! We're checking our latest listings for you. Our team will reach out shortly with the best options.\n\nWhen are you looking to move in?`;
            }
        }

        // ── PHASE 3: Move-in date ──
        if (brochureSent && !moveInAnswered) {
            requirements._move_in_date = userMessage;

            const urgentPhrases = ['asap', 'immediately', 'urgent', 'this month', 'right now', 'now', 'soon', 'quickly', 'as soon as possible', 'earliest'];
            const isUrgent = urgentPhrases.some(p => userMessage.toLowerCase().includes(p));

            if (isUrgent && !requirements._urgent_alert_sent) {
                try {
                    if (orgInfo?.phone) {
                        await sendWhatsAppMessage(orgInfo.phone,
                            `🔥 *Hot Lead Alert!*\n\nName: ${requirements.name || 'Unknown'}\nPhone: ${lead.phone}\nLooking to: ${requirements.rent_or_buy}\nBHK: ${requirements.bhk}\nArea: ${requirements.area}\nBudget: ${requirements.budget}\nMove-in: ${userMessage}\n\nThis lead wants to move in ASAP. Contact them immediately!`
                        );
                    }
                    requirements._urgent_alert_sent = true;
                    await pool.query(
                        "UPDATE leads SET score_label = 'hot', score = 90, updated_at = NOW() WHERE id = $1",
                        [lead.id]
                    );
                } catch (e) { console.error('[Alert] urgent error:', e); }
            }

            await pool.query(
                'UPDATE leads SET requirements = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(requirements), lead.id]
            );

            return `Perfect! Our team will contact you soon with the best available options. Feel free to ask if you have any questions. 😊`;
        }

        // ── PHASE 4: Post-brochure conversation ──

        // Activity detection
        const recentActivity = await pool.query(
            `SELECT COUNT(*) FROM conversations WHERE lead_id = $1 AND sender = 'customer' AND created_at > NOW() - INTERVAL '10 minutes'`,
            [lead.id]
        );
        const isHighActivity = parseInt(recentActivity.rows[0].count) >= 5;

        if (isHighActivity && !requirements._activity_alert_sent) {
            try {
                if (orgInfo?.phone) {
                    await sendWhatsAppMessage(orgInfo.phone,
                        `⚡ *Active Lead Alert!*\n\nName: ${requirements.name || 'Unknown'}\nPhone: ${lead.phone}\n\nThis lead is very active right now. Check the conversation!`
                    );
                }
                requirements._activity_alert_sent = true;
                await pool.query(
                    'UPDATE leads SET requirements = $1 WHERE id = $2',
                    [JSON.stringify(requirements), lead.id]
                );
            } catch (e) { console.error('[Alert] activity error:', e); }
        }

        // Interest detection
        const interestPhrases = ['i like', 'i want', 'interested', 'this one', 'that one', 'looks good', 'book', 'want to see', 'visit', 'i\'ll take', 'perfect'];
        const hasInterest = interestPhrases.some(p => userMessage.toLowerCase().includes(p));

        if (hasInterest && !requirements._interest_alert_sent) {
            try {
                if (orgInfo?.phone) {
                    await sendWhatsAppMessage(orgInfo.phone,
                        `🏠 *Property Interest Alert!*\n\nName: ${requirements.name || 'Unknown'}\nPhone: ${lead.phone}\n\nThe customer has expressed interest in a property. Reach out now!`
                    );
                }
                requirements._interest_alert_sent = true;
                await pool.query(
                    'UPDATE leads SET requirements = $1 WHERE id = $2',
                    [JSON.stringify(requirements), lead.id]
                );
            } catch (e) { console.error('[Alert] interest error:', e); }

            return `Great choice! Our team will contact you shortly to arrange a visit and share more details. 😊`;
        }

        // Default post-brochure reply — route through Haiku for a contextual answer.
        try {
            const Anthropic = require('@anthropic-ai/sdk');
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

            const historyRes = await pool.query(
                `SELECT sender, message FROM conversations
                 WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 8`,
                [lead.id]
            );
            const history = historyRes.rows.reverse()
                .map(r => `${r.sender === 'customer' ? 'Buyer' : 'Assistant'}: ${r.message}`)
                .join('\n');

            const aiReply = await anthropic.messages.create({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 200,
                system: `You are a warm, helpful WhatsApp assistant for ${orgInfo?.name || 'a real estate agency'}.

The buyer has already received a brochure with matching properties. A human agent will follow up to share details and arrange visits.

Buyer's requirements: ${JSON.stringify({ name: requirements.name, looking_to: requirements.rent_or_buy, bhk: requirements.bhk, area: requirements.area, budget: requirements.budget })}

RULES:
- Reply in 1-2 short sentences, WhatsApp style.
- Be warm and conversational.
- You may answer general questions (how the process works, timing, what happens next).
- You do NOT have specific details about individual properties (exact parking, floor, price negotiability, legal/loan terms, availability of a specific unit). For anything like that, say the agent will confirm shortly. NEVER invent property details.
- Do not repeat the buyer's full requirement list back to them.
- If the buyer wants to proceed or visit, reassure them the agent will reach out soon.`,
                messages: [{
                    role: 'user',
                    content: `Recent conversation:\n${history}\n\nBuyer's latest message: "${userMessage}"\n\nWrite a helpful reply.`
                }]
            });

            const reply = aiReply.content[0]?.text?.trim();
            if (reply) return reply;
        } catch (e) {
            console.error('[Phase4] Haiku error:', e);
        }

        return `Thank you for your interest! Our team will be in touch with you soon. 😊`;

    } catch (error) {
        console.error('AI response error:', error);
        const questions = config?.questions || [];
        const requirements = lead.requirements || {};
        const nextQuestion = questions.find(q => !requirements[q.key]);
        if (!nextQuestion) return `Thank you! Our team will contact you shortly.`;
        if (Object.keys(requirements).length === 0) return `${config?.greeting_message || 'Hello!'}\n\n${nextQuestion.question}`;
        return nextQuestion.question;
    }
};

// Acknowledgment helper — add this just above getAIResponse
const getAck = (savedKey, value, name) => {
    switch (savedKey) {
        case 'name': return `Great to meet you, ${value}! 😊`;
        case 'rent_or_buy': return `Got it!`;
        case 'bhk': return `Perfect!`;
        case 'area': return `${value} sounds great!`;
        case 'budget': return `Noted!`;
        default: return `Got it!`;
    }
};
// ── Handle agent image upload ──
const handleAgentImage = async (organizationId, imageId) => {
    try {
        // Get image URL from Meta
        const metaResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${imageId}`,
            { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
        );
        const imageUrl = metaResponse.data.url;

        // Download image buffer from Meta
        const imageBuffer = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
        });

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'ourivo/properties', resource_type: 'image' },
                (error, result) => { if (error) reject(error); else resolve(result); }
            ).end(Buffer.from(imageBuffer.data));
        });

        const cloudinaryUrl = uploadResult.secure_url;

        // Attach to most recent property for this org
        const latest = await pool.query(
            `SELECT id, images FROM properties WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [organizationId]
        );

        if (latest.rows.length === 0) {
            return `❌ No property found to attach this image to. Add a listing first.`;
        }

        const property = latest.rows[0];
        const updatedImages = [...(property.images || []), cloudinaryUrl];

        await pool.query(
            'UPDATE properties SET images = $1, updated_at = NOW() WHERE id = $2',
            [updatedImages, property.id]
        );

        return `📸 Image added to your latest listing!\n\nView: https://ourivo.com/dashboard/inventory`;
    } catch (error) {
        console.error('Image upload error:', error);
        return `Failed to upload image. Please try again.`;
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

        const incomingPhoneNumberId = value?.metadata?.phone_number_id;
        console.log(`Incoming message to phone_number_id: ${incomingPhoneNumberId}`);

        if (!incomingPhoneNumberId) {
            console.error('No phone_number_id in webhook metadata — cannot route. Dropping.');
            return res.sendStatus(200);
        }

        // Route to the org that owns this WhatsApp number.
        const orgResult = await pool.query(
            'SELECT id, phone, email, name FROM organizations WHERE whatsapp_phone_number_id = $1 ORDER BY created_at ASC LIMIT 1',
            [incomingPhoneNumberId]
        );

        console.log(`Routing to org: ${orgResult.rows[0]?.id}`);

        if (orgResult.rows.length === 0) {
            console.error(`No org found for phone_number_id ${incomingPhoneNumberId}. Dropping message.`);
            return res.sendStatus(200);
        }

        const organizationId = orgResult.rows[0].id;
        const ownerPhone = orgResult.rows[0].phone;
        const ownerEmail = orgResult.rows[0].email;
        const orgName = orgResult.rows[0].name;

        // Check if message is from the agent — route to inventory parser
        if (ownerPhone && from === ownerPhone) {
            let reply;
            if (message.type === 'image') {
                const imageId = message.image?.id;
                reply = await handleAgentImage(organizationId, imageId);
            } else {
                reply = await handleInventoryMessage(organizationId, from, messageText);
            }
            await sendWhatsAppMessage(from, reply);
            return res.sendStatus(200);
        }

        // Get or create lead
        const { lead, isNew } = await getOrCreateLead(organizationId, from, contactName);

        // Guard: non-text messages (reactions, stickers, location) have no body.
        if (!messageText || !messageText.trim()) {
            await sendWhatsAppMessage(from, 'Please send your message as text so I can help you. 😊');
            return res.sendStatus(200);
        }

        // Save incoming message
        await saveMessage(organizationId, lead.id, messageText, 'customer');

        // Generate and send bot response
        const config = await getChatbotConfig(organizationId);
        const orgInfoResult = await pool.query(
            'SELECT name, phone, email, description, service_locations, working_hours FROM organizations WHERE id = $1',
            [organizationId]
        );
        const orgInfo = orgInfoResult.rows[0];
        const response = await getAIResponse(messageText, lead, config, orgInfo);
        await saveMessage(organizationId, lead.id, response, 'bot');
        await sendWhatsAppMessage(from, response);

        // Hot lead notification — check if lead just became Hot
        const scoredLead = await pool.query('SELECT score_label FROM leads WHERE id = $1', [lead.id]);
        const currentScoreLabel = scoredLead.rows[0]?.score_label;
        const wasHotBefore = lead.score_label === 'hot';
        const isNowHot = currentScoreLabel === 'hot';

        if (!wasHotBefore && isNowHot) {
            const hotNotificationMessage =
                `🔥 Hot Lead Alert!\n\n` +
                `👤 Name: ${contactName}\n` +
                `📱 Phone: +${from}\n` +
                `📊 This lead just qualified as HOT.\n\n` +
                `View dashboard: https://ourivo.com/dashboard`;

            if (ownerPhone) {
                await sendWhatsAppMessage(ownerPhone, hotNotificationMessage);
                console.log(`Hot lead WhatsApp alert sent to ${ownerPhone}`);
            }
            if (ownerEmail) {
                await sendEmailNotification(ownerEmail, orgName, contactName, from, `🔥 Lead scored HOT — all qualifying questions answered.`);
            }
        }

        // Send notifications for NEW leads only
        if (isNew) {
            const notificationMessage =
                `🔔 New Lead Captured!\n\n` +
                `👤 Name: ${contactName}\n` +
                `📱 Phone: +${from}\n` +
                `💬 Message: "${messageText}"\n\n` +
                `View dashboard: https://ourivo.com/dashboard`;

            if (ownerPhone) {
                await sendWhatsAppMessage(ownerPhone, notificationMessage);
                console.log(`WhatsApp notification sent to ${ownerPhone}`);
            }

            if (ownerEmail) {
                await sendEmailNotification(ownerEmail, orgName, contactName, from, messageText);
            }
        }

        console.log(`Response sent to ${from}: ${response}`);
        res.sendStatus(200);

    } catch (error) {
        console.error('Webhook error:', error);
        // Return 200 so Meta does not retry and re-trigger the same failure in a loop.
        res.sendStatus(200);
    }
};

module.exports = { verify, handleMessage };