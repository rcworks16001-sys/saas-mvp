//This is the most important step — we create the multi-tenant structure that everything else sits on.

const pool = require('./index');

const createTables = async () => {
    try {

        // 1. Organizations table (each business is one organization)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        industry VARCHAR(100) DEFAULT 'real_estate',
        subscription_plan VARCHAR(50) DEFAULT 'trial',
        subscription_status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Organizations table ready');

        // 2. Users table (agents/team members of each organization)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Users table ready');

        // 3. Chatbot config table (each org has their own chatbot settings)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbot_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        greeting_message TEXT DEFAULT 'Hello! How can I help you today?',
        questions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Chatbot configs table ready');

        // 4. Leads table (every captured lead belongs to one organization)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        whatsapp_number VARCHAR(20),
        message TEXT,
        requirements JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'new',
        source VARCHAR(100) DEFAULT 'whatsapp',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Leads table ready');

        // 5. Conversations table (stores all chat messages per lead)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        sender VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Conversations table ready');

        console.log('All tables created successfully');
        process.exit(0);

    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createTables();