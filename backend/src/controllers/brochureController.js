const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const pool = require('../db');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Parse budget string like "45 lakhs", "1.2 crore", "50L", "1CR" to a number in lakhs
const parseBudget = (budgetStr) => {
    if (!budgetStr) return null;
    const str = budgetStr.toString().toLowerCase().replace(/,/g, '').trim();
    const croreMatch = str.match(/(\d+\.?\d*)\s*(cr|crore|c)/);
    const lakhMatch = str.match(/(\d+\.?\d*)\s*(l|lakh|lakhs|lac)/);
    const plainMatch = str.match(/(\d+\.?\d*)/);
    if (croreMatch) return parseFloat(croreMatch[1]) * 100;
    if (lakhMatch) return parseFloat(lakhMatch[1]);
    if (plainMatch) {
        const val = parseFloat(plainMatch[1]);
        // If > 1000, assume it's already a raw number in thousands — treat as lakhs/100
        return val > 1000 ? val / 100000 : val;
    }
    return null;
};

// Parse BHK string like "2BHK", "3 bhk", "2" to integer
const parseBHK = (bhkStr) => {
    if (!bhkStr) return null;
    const match = bhkStr.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
};

// Match properties from DB against lead requirements
const matchProperties = async (requirements, orgId) => {
    const area = requirements.area || null;
    const budgetLakhs = parseBudget(requirements.budget);
    const bhk = parseBHK(requirements.bhk);

    // Build query dynamically
    let conditions = [`organization_id = $1`, `status = 'available'`];
    let params = [orgId];
    let idx = 2;

    if (area) {
        conditions.push(`location ILIKE $${idx}`);
        params.push(`%${area}%`);
        idx++;
    }
    if (bhk) {
        conditions.push(`bedrooms = $${idx}`);
        params.push(bhk);
        idx++;
    }
    if (budgetLakhs) {
        // Allow 20% above budget
        conditions.push(`price <= $${idx}`);
        params.push(Math.round(budgetLakhs * 1.2));
        idx++;
    }

    const query = `SELECT * FROM properties WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 3`;
    const result = await pool.query(query, params);

    // If strict match returns nothing, fall back to location-only match
    if (result.rows.length === 0 && area) {
        const fallback = await pool.query(
            `SELECT * FROM properties WHERE organization_id = $1 AND status = 'available' AND location ILIKE $2 ORDER BY created_at DESC LIMIT 3`,
            [orgId, `%${area}%`]
        );
        return fallback.rows;
    }

    // If still nothing, return latest 3 available
    if (result.rows.length === 0) {
        const fallback = await pool.query(
            `SELECT * FROM properties WHERE organization_id = $1 AND status = 'available' ORDER BY created_at DESC LIMIT 3`,
            [orgId]
        );
        return fallback.rows;
    }

    return result.rows;
};

// Generate PDF buffer
const generatePDF = (properties, org, leadName) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - 100; // accounting for margins

        // ── Header ──
        doc.rect(0, 0, doc.page.width, 90).fill('#000000');
        doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(26)
            .text(org.name || 'Property Listings', 50, 28, { width: pageWidth });
        doc.fillColor('#cccccc')
            .font('Helvetica')
            .fontSize(10)
            .text(
                [org.phone, org.email, org.website].filter(Boolean).join('  |  '),
                50, 62, { width: pageWidth }
            );

        // ── Subheader ──
        doc.moveDown(2);
        doc.fillColor('#000000')
            .font('Helvetica-Bold')
            .fontSize(13)
            .text(`Properties Matched for ${leadName || 'You'}`, 50, 110);
        doc.moveTo(50, 128).lineTo(doc.page.width - 50, 128).strokeColor('#e5e7eb').lineWidth(1).stroke();

        let y = 140;

        properties.forEach((prop, i) => {
            // Card background
            doc.roundedRect(50, y, pageWidth, 140, 8).fill('#f3f3f3');

            // Property number badge
            doc.circle(75, y + 20, 12).fill('#000000');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(`${i + 1}`, 70, y + 14);

            // Title
            doc.fillColor('#000000')
                .font('Helvetica-Bold')
                .fontSize(14)
                .text(prop.title || 'Property', 95, y + 10, { width: pageWidth - 60 });

            // Location
            doc.fillColor('#444444')
                .font('Helvetica')
                .fontSize(11)
                .text(`📍 ${prop.location || '—'}`, 95, y + 30);

            // Details row
            const details = [
                prop.bedrooms ? `${prop.bedrooms} BHK` : null,
                prop.area_sqft ? `${prop.area_sqft} sq.ft` : null,
                prop.furnishing || null,
            ].filter(Boolean).join('   •   ');

            doc.fillColor('#444444')
                .font('Helvetica')
                .fontSize(11)
                .text(details, 95, y + 50);

            // Price
            const priceDisplay = prop.price
                ? prop.price >= 100
                    ? `₹${(prop.price / 100).toFixed(2)} Cr`
                    : `₹${prop.price} L`
                : '—';

            doc.fillColor('#000000')
                .font('Helvetica-Bold')
                .fontSize(16)
                .text(priceDisplay, 95, y + 75);

            // Status badge
            doc.roundedRect(pageWidth - 10, y + 10, 70, 22, 4).fill('#d1ffca');
            doc.fillColor('#000000')
                .font('Helvetica-Bold')
                .fontSize(9)
                .text('AVAILABLE', pageWidth - 5, y + 17, { width: 60, align: 'center' });

            y += 160;

            // Page break if needed
            if (y > doc.page.height - 180 && i < properties.length - 1) {
                doc.addPage();
                y = 50;
            }
        });

        // ── Footer ──
        doc.moveTo(50, doc.page.height - 60)
            .lineTo(doc.page.width - 50, doc.page.height - 60)
            .strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.fillColor('#979797')
            .font('Helvetica')
            .fontSize(9)
            .text(
                `Generated by Ourivo  •  ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                50, doc.page.height - 45, { align: 'center', width: pageWidth }
            );

        doc.end();
    });
};

// Upload PDF buffer to Cloudinary
const uploadPDFToCloudinary = (pdfBuffer, leadId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                folder: 'ourivo/brochures',
                public_id: `brochure_${leadId}_${Date.now()}`,
                format: 'pdf',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(pdfBuffer);
    });
};

// Main function — called from webhookController
const matchAndSendBrochure = async (lead, requirements, orgId, sendWhatsAppMessage, orgPhone) => {
    try {
        console.log(`[Brochure] Starting for lead ${lead.id}, org ${orgId}`);

        // 1. Fetch org details
        const orgResult = await pool.query('SELECT * FROM organizations WHERE id = $1', [orgId]);
        const org = orgResult.rows[0];
        if (!org) throw new Error('Org not found');

        // 2. Match properties
        const properties = await matchProperties(requirements, orgId);
        console.log(`[Brochure] Matched ${properties.length} properties`);
        if (properties.length === 0) {
            console.log('[Brochure] No properties found, skipping brochure');
            return;
        }

        // 3. Generate PDF
        const leadName = requirements.name || 'Valued Customer';
        const pdfBuffer = await generatePDF(properties, org, leadName);
        console.log(`[Brochure] PDF generated, size: ${pdfBuffer.length} bytes`);

        // 4. Upload to Cloudinary
        const pdfUrl = await uploadPDFToCloudinary(pdfBuffer, lead.id);
        console.log(`[Brochure] Uploaded to Cloudinary: ${pdfUrl}`);

        // 5. Send as WhatsApp document to buyer
        await sendWhatsAppDocumentMessage(lead.phone, pdfUrl, org.name, requirements.name);
        console.log(`[Brochure] Sent to buyer ${lead.phone}`);

    } catch (err) {
        console.error('[Brochure] Error:', err);
        // Non-fatal — don't crash the main webhook flow
    }
};

// Send WhatsApp document message
const sendWhatsAppDocumentMessage = async (toPhone, pdfUrl, orgName, leadName) => {
    const axios = require('axios');
    const payload = {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'document',
        document: {
            link: pdfUrl,
            caption: `Hi ${leadName || 'there'}! Here are some properties we think you'll love. Feel free to reply if you have questions.`,
            filename: `${orgName || 'Properties'}_Brochure.pdf`,
        },
    };
    await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
    );
};

module.exports = { matchAndSendBrochure };