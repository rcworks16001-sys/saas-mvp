const pool = require('../db/index');
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if email already registered
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1', [email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing OTPs for this email
        await pool.query('DELETE FROM email_otps WHERE email = $1', [email]);

        // Store new OTP
        await pool.query(
            'INSERT INTO email_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        // Send email
        await resend.emails.send({
            from: 'Ourivo <noreply@ourivo.com>',
            to: email,
            subject: 'Your Ourivo verification code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0F1115; color: #F5F7FA; padding: 40px; border-radius: 16px;">
                    <div style="margin-bottom: 32px;">
                        <span style="font-size: 24px; font-weight: 800; color: #F5F7FA;">Our</span><span style="font-size: 24px; font-weight: 800; color: #4F8CFF;">ivo</span>
                    </div>
                    <h2 style="color: #F5F7FA; font-size: 20px; margin-bottom: 8px;">Verify your email</h2>
                    <p style="color: #9AA4B2; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
                        Enter this code to complete your registration. It expires in 10 minutes.
                    </p>
                    <div style="background: #161A22; border: 1px solid #2A3142; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                        <div style="font-size: 40px; font-weight: 800; color: #4F8CFF; letter-spacing: 12px;">
                            ${otp}
                        </div>
                    </div>
                    <p style="color: #5C6A7E; font-size: 12px; line-height: 1.6;">
                        If you didn't request this, ignore this email. This code expires in 10 minutes.
                    </p>
                </div>
            `
        });

        res.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM email_otps 
             WHERE email = $1 AND otp = $2 AND used = false AND expires_at > NOW()`,
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await pool.query(
            'UPDATE email_otps SET used = true WHERE email = $1',
            [email]
        );

        res.json({ verified: true });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

module.exports = { sendOTP, verifyOTP };