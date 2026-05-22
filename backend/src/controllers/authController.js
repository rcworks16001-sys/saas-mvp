const pool = require('../db/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new organization + owner
const register = async (req, res) => {
    const { orgName, name, email, password, phone } = req.body;

    try {
        // Check if email already exists
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1', [email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create organization
        const org = await pool.query(
            `INSERT INTO organizations (name, email, phone, subscription_status, subscription_plan, trial_ends_at)
           VALUES ($1, $2, $3, 'trial', 'trial', NOW() + INTERVAL '14 days') RETURNING id`,
            [orgName, email, phone]
        );
        const organizationId = org.rows[0].id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create owner user
        const user = await pool.query(
            `INSERT INTO users (organization_id, name, email, password, role)
       VALUES ($1, $2, $3, $4, 'owner') RETURNING id, name, email, role`,
            [organizationId, name, email, hashedPassword]
        );

        // Create default chatbot config
        await pool.query(
            `INSERT INTO chatbot_configs (organization_id, greeting_message, questions)
       VALUES ($1, $2, $3)`,
            [
                organizationId,
                'Hello! I am an AI assistant. How can I help you today?',
                JSON.stringify([
                    { id: 1, question: 'May I know your name?', key: 'name' },
                    { id: 2, question: 'What is your budget?', key: 'budget' },
                    { id: 3, question: 'Which area are you looking in?', key: 'area' },
                    { id: 4, question: 'How many BHK do you need?', key: 'bhk' }
                ])
            ]
        );

        // Generate token
        const token = jwt.sign(
            { userId: user.rows[0].id, organizationId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: user.rows[0],
            organizationId
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.password, u.role, u.organization_id
       FROM users u WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, organizationId: user.organization_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            organizationId: user.organization_id
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Delete account
const deleteAccount = async (req, res) => {
    const { organizationId } = req.user;

    try {
        // Cancel Razorpay subscription if active (just update status, no charge)
        await pool.query(
            `UPDATE organizations 
             SET subscription_status = 'cancelled', subscription_plan = 'cancelled'
             WHERE id = $1`,
            [organizationId]
        );

        // Delete all data — cascade will handle leads, conversations, etc.
        await pool.query(
            'DELETE FROM organizations WHERE id = $1',
            [organizationId]
        );

        res.json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

module.exports = { register, login, deleteAccount };