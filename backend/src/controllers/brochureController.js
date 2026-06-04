const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const pool = require('../db');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        return val > 1000 ? val / 100000 : val;
    }
    return null;
};

const parseBHK = (bhkStr) => {
    if (!bhkStr) return null;
    const match = bhkStr.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
};

// Returns { exactMatches, proximityMatches }
const matchProperties = async (requirements, orgId) => {
    const area = requirements.area || null;
    const budgetLakhs = parseBudget(requirements.budget);
    const bhk = parseBHK(requirements.bhk);

    // Exact match: area + bhk + budget within 120%
    let exactConditions = [`organization_id = $1`, `status = 'available'`];
    let exactParams = [orgId];
    let idx = 2;

    if (area) {
        exactConditions.push(`(location ILIKE $${idx} OR similarity(location, $${idx + 1}) > 0.3)`);
        exactParams.push(`%${area}%`, area);
        idx += 2;
    }
    if (bhk) { exactConditions.push(`bedrooms = $${idx}`); exactParams.push(bhk); idx++; }
    if (budgetLakhs) { exactConditions.push(`price <= $${idx}`); exactParams.push(Math.round(budgetLakhs * 1.2)); idx++; }

    const exactResult = await pool.query(
        `SELECT * FROM properties WHERE ${exactConditions.join(' AND ')} ORDER BY created_at DESC LIMIT 3`,
        exactParams
    );
    const exactMatches = exactResult.rows;
    const exactIds = exactMatches.map(p => p.id);

    // Proximity match: same area, ±1 BHK, ±30% budget — exclude exact matches
    let proxConditions = [`organization_id = $1`, `status = 'available'`];
    let proxParams = [orgId];
    idx = 2;

    if (exactIds.length > 0) {
        proxConditions.push(`id != ALL($${idx})`);
        proxParams.push(exactIds);
        idx++;
    }
    if (area) {
        proxConditions.push(`(location ILIKE $${idx} OR similarity(location, $${idx + 1}) > 0.3)`);
        proxParams.push(`%${area}%`, area);
        idx += 2;
    }
    if (bhk) {
        proxConditions.push(`bedrooms BETWEEN $${idx} AND $${idx + 1}`);
        proxParams.push(Math.max(1, bhk - 1), bhk + 1);
        idx += 2;
    }
    if (budgetLakhs) {
        proxConditions.push(`price BETWEEN $${idx} AND $${idx + 1}`);
        proxParams.push(Math.round(budgetLakhs * 0.7), Math.round(budgetLakhs * 1.3));
        idx += 2;
    }

    const proxResult = await pool.query(
        `SELECT * FROM properties WHERE ${proxConditions.join(' AND ')} ORDER BY created_at DESC LIMIT 3`,
        proxParams
    );
    const proximityMatches = proxResult.rows;

    return { exactMatches, proximityMatches };
};

const generatePDF = (exactMatches, proximityMatches, org, leadName) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - 100;

        // Header
        doc.rect(0, 0, doc.page.width, 90).fill('#000000');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26)
            .text(org.name || 'Property Listings', 50, 28, { width: pageWidth });
        doc.fillColor('#cccccc').font('Helvetica').fontSize(10)
            .text([org.phone, org.email, org.website].filter(Boolean).join('  |  '), 50, 62, { width: pageWidth });

        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(13)
            .text(`Properties Curated for ${leadName || 'You'}`, 50, 110);
        doc.moveTo(50, 128).lineTo(doc.page.width - 50, 128).strokeColor('#e5e7eb').lineWidth(1).stroke();

        let y = 142;

        const drawProperty = (prop, index, label) => {
            if (y > doc.page.height - 200) { doc.addPage(); y = 50; }

            doc.roundedRect(50, y, pageWidth, 145, 8).fill('#f3f3f3');

            // Badge
            doc.circle(75, y + 20, 12).fill('#000000');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(`${index + 1}`, 70, y + 14);

            // Label tag
            const tagColor = label === 'Best Match' ? '#d1ffca' : '#fff1ca';
            doc.roundedRect(doc.page.width - 160, y + 10, 100, 20, 4).fill(tagColor);
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8)
                .text(label.toUpperCase(), doc.page.width - 155, y + 17, { width: 90, align: 'center' });

            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(14)
                .text(prop.title || 'Property', 95, y + 10, { width: pageWidth - 120 });
            doc.fillColor('#444444').font('Helvetica').fontSize(11)
                .text(`${prop.location || '—'}`, 95, y + 32);

            const bhkNum = parseBHK(prop.bedrooms);
            const details = [
                bhkNum ? `${bhkNum} BHK` : null,
                prop.area_sqft ? `${prop.area_sqft} sq.ft` : null,
                prop.furnishing || null,
            ].filter(Boolean).join('   •   ');
            doc.fillColor('#444444').font('Helvetica').fontSize(11).text(details, 95, y + 52);

            const priceLakhs = parseBudget(prop.price);
            const priceDisplay = priceLakhs
                ? priceLakhs >= 100 ? `Rs. ${(priceLakhs / 100).toFixed(2)} Cr` : `Rs. ${priceLakhs} L`
                : '—';
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(16).text(priceDisplay, 95, y + 78);

            y += 165;
        };

        if (exactMatches.length > 0) {
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11).text('Best Matches', 50, y);
            y += 20;
            exactMatches.forEach((p, i) => drawProperty(p, i, 'Best Match'));
        }

        if (proximityMatches.length > 0) {
            if (y > doc.page.height - 250) { doc.addPage(); y = 50; }
            doc.fillColor('#444444').font('Helvetica-Bold').fontSize(11).text('You Might Also Like', 50, y);
            y += 20;
            proximityMatches.forEach((p, i) => drawProperty(p, i, 'Similar'));
        }

        // Footer
        doc.moveTo(50, doc.page.height - 60).lineTo(doc.page.width - 50, doc.page.height - 60)
            .strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.fillColor('#979797').font('Helvetica').fontSize(9)
            .text(
                `Generated by Ourivo  •  ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                50, doc.page.height - 45, { align: 'center', width: pageWidth }
            );

        doc.end();
    });
};

const uploadPDFToCloudinary = (pdfBuffer, leadId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'ourivo/brochures', public_id: `brochure_${leadId}_${Date.now()}`, format: 'pdf' },
            (error, result) => { if (error) reject(error); else resolve(result.secure_url); }
        );
        uploadStream.end(pdfBuffer);
    });
};

const sendWhatsAppDocument = async (toPhone, pdfUrl, orgName, leadName) => {
    const axios = require('axios');
    await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: 'whatsapp',
            to: toPhone,
            type: 'document',
            document: {
                link: pdfUrl,
                caption: `Hi ${leadName || 'there'}! Here are some properties we think you'll love. Feel free to reply if you have any questions. 😊`,
                filename: `${orgName || 'Properties'}_Brochure.pdf`,
            },
        },
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
    );
};

const generateAndSendBrochure = async (lead, requirements, exactMatches, proximityMatches, org) => {
    try {
        console.log(`[Brochure] Generating for lead ${lead.id}`);
        const leadName = requirements.name || 'Valued Customer';
        const pdfBuffer = await generatePDF(exactMatches, proximityMatches, org, leadName);
        console.log(`[Brochure] PDF size: ${pdfBuffer.length} bytes`);
        const pdfUrl = await uploadPDFToCloudinary(pdfBuffer, lead.id);
        console.log(`[Brochure] Uploaded: ${pdfUrl}`);
        await sendWhatsAppDocument(lead.phone, pdfUrl, org.name, leadName);
        console.log(`[Brochure] Sent to ${lead.phone}`);
    } catch (err) {
        console.error('[Brochure] Error:', err);
    }
};

module.exports = { matchProperties, generateAndSendBrochure };