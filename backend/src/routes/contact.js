const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        // Email to support
        await resend.emails.send({
            from: 'Ourivo Contact <noreply@ourivo.com>',
            to: 'support@ourivo.com',
            subject: `New message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0F1115; color: #F5F7FA; padding: 32px; border-radius: 12px;">
                    <h2 style="color: #F5F7FA; margin: 0 0 24px 0;">New Contact Message</h2>
                    <div style="background: #161A22; border: 1px solid #2A3142; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                        <p style="color: #9AA4B2; margin: 0 0 8px 0;"><strong style="color: #F5F7FA;">Name:</strong> ${name}</p>
                        <p style="color: #9AA4B2; margin: 0 0 8px 0;"><strong style="color: #F5F7FA;">Email:</strong> ${email}</p>
                        <p style="color: #9AA4B2; margin: 0;"><strong style="color: #F5F7FA;">Message:</strong><br/>${message}</p>
                    </div>
                </div>
            `
        });

        // Confirmation email to sender
        await resend.emails.send({
            from: 'Ourivo <noreply@ourivo.com>',
            to: email,
            subject: 'We received your message — Ourivo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0F1115; color: #F5F7FA; padding: 32px; border-radius: 12px;">
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 24px; font-weight: 800; color: #F5F7FA;">Our</span><span style="font-size: 24px; font-weight: 800; color: #4F8CFF;">ivo</span>
                    </div>
                    <h2 style="color: #F5F7FA; margin: 0 0 12px 0;">We got your message, ${name}.</h2>
                    <p style="color: #9AA4B2; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                        Thank you for reaching out. We have received your message and will get back to you as soon as possible.
                    </p>
                    <div style="background: #161A22; border: 1px solid #2A3142; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                        <p style="color: #5C6A7E; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.08em;">Your message</p>
                        <p style="color: #9AA4B2; font-size: 14px; line-height: 1.7; margin: 0; font-style: italic;">"${message}"</p>
                    </div>
                    <p style="color: #5C6A7E; font-size: 13px; margin: 0;">
                        If you have anything to add, reply to this email or message us on WhatsApp at +91 72940 34023.
                    </p>
                </div>
            `
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Contact email error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;