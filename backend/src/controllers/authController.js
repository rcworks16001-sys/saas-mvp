const pool = require('../db/index');

// Delete account
const deleteAccount = async (req, res) => {
    const { organizationId } = req.user;

    try {
        await pool.query(
            `UPDATE organizations 
             SET subscription_status = 'cancelled', subscription_plan = 'cancelled'
             WHERE id = $1`,
            [organizationId]
        );

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

module.exports = { deleteAccount };