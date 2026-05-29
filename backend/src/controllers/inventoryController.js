const pool = require('../db/index');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Parse agent message with Claude ──
const parsePropertyMessage = async (message) => {
    try {
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            system: `You are a property listing parser for an Indian real estate business.
Extract property details from the agent's message and return ONLY a valid JSON object.
No explanation, no markdown, no backticks — raw JSON only.

Fields to extract:
- title (string — e.g. "3BHK Apartment Velachery")
- location (string)
- price (string — e.g. "45L", "1.2Cr", "45,00,000")
- bedrooms (string — e.g. "3BHK", "2BHK", "Villa")
- area_sqft (string — e.g. "1200")
- furnishing (string — "furnished", "semi-furnished", "unfurnished", or null)
- status (string — "available", "sold", "rented" — default "available")

If a field is not mentioned, set it to null.`,
            messages: [{ role: 'user', content: message }]
        });

        const raw = response.content[0].text.trim().replace(/```json|```/g, '').trim();
        return JSON.parse(raw);
    } catch (error) {
        console.error('Property parse error:', error);
        return null;
    }
};

// ── Handle incoming agent inventory message ──
const handleInventoryMessage = async (organizationId, agentPhone, message) => {
    // Detect status update commands
    const statusMatch = message.match(/^(SOLD|RENTED|AVAILABLE):\s+(.+)/i);
    if (statusMatch) {
        const newStatus = statusMatch[1].toLowerCase();
        const searchTerm = statusMatch[2].trim();

        try {
            // Find closest matching property
            const result = await pool.query(
                `SELECT * FROM properties 
                 WHERE organization_id = $1 
                 AND (title ILIKE $2 OR location ILIKE $2 OR raw_message ILIKE $2)
                 ORDER BY created_at DESC LIMIT 1`,
                [organizationId, `%${searchTerm.split(' ')[0]}%`]
            );

            if (result.rows.length === 0) {
                return `❌ No matching property found for "${searchTerm}". Check your inventory: https://ourivo.com/dashboard/inventory`;
            }

            const property = result.rows[0];
            await pool.query(
                'UPDATE properties SET status = $1, updated_at = NOW() WHERE id = $2',
                [newStatus, property.id]
            );

            return `✅ Updated!\n\n🏢 ${property.title}\n📍 ${property.location}\nStatus → *${newStatus.toUpperCase()}*\n\nView all: https://ourivo.com/dashboard/inventory`;
        } catch (error) {
            console.error('Status update error:', error);
            return `Failed to update status. Try again.`;
        }
    }

    // Otherwise treat as new listing
    const parsed = await parsePropertyMessage(message);

    if (!parsed) {
        return `Sorry, I couldn't understand that.\n\nTo *add* a listing:\nAdd: 3BHK Velachery 45L semi-furnished 1200sqft\n\nTo *update status*:\nSOLD: 3BHK Velachery\nRENTED: 3BHK Velachery\nAVAILABLE: 3BHK Velachery`;
    }

    try {
        await pool.query(
            `INSERT INTO properties 
             (organization_id, title, location, price, bedrooms, area_sqft, furnishing, status, raw_message)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                organizationId,
                parsed.title,
                parsed.location,
                parsed.price,
                parsed.bedrooms,
                parsed.area_sqft,
                parsed.furnishing,
                parsed.status || 'available',
                message
            ]
        );

        const details = [
            parsed.title,
            parsed.location && `📍 ${parsed.location}`,
            parsed.price && `💰 ${parsed.price}`,
            parsed.bedrooms && `🛏 ${parsed.bedrooms}`,
            parsed.area_sqft && `📐 ${parsed.area_sqft} sqft`,
            parsed.furnishing && `🪑 ${parsed.furnishing}`
        ].filter(Boolean).join('\n');

        return `✅ Property added!\n\n${details}\n\nView all: https://ourivo.com/dashboard/inventory`;
    } catch (error) {
        console.error('Inventory insert error:', error);
        return `Failed to save property. Please try again.`;
    }
};

// ── GET /api/inventory ──
const getProperties = async (req, res) => {
    const { organizationId } = req.user;
    try {
        const result = await pool.query(
            `SELECT * FROM properties WHERE organization_id = $1 ORDER BY created_at DESC`,
            [organizationId]
        );
        res.json({ properties: result.rows, total: result.rows.length });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};

// ── PATCH /api/inventory/:id ──
const updateProperty = async (req, res) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'sold', 'rented'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const result = await pool.query(
            `UPDATE properties SET status = $1, updated_at = NOW()
             WHERE id = $2 AND organization_id = $3 RETURNING *`,
            [status, id, organizationId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
        res.json({ property: result.rows[0] });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
};

// ── DELETE /api/inventory/:id ──
const deleteProperty = async (req, res) => {
    const { organizationId } = req.user;
    const { id } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM properties WHERE id = $1 AND organization_id = $2 RETURNING id`,
            [id, organizationId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
        res.json({ message: 'Property deleted' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
};

module.exports = { handleInventoryMessage, getProperties, updateProperty, deleteProperty };