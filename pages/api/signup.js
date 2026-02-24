import { query } from '../../lib/db/connection';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        console.log('Signup proxy attempt:', { email });

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Default username from email if not provided
        const username = email.split('@')[0];

        // Check if user exists
        const existing = await query('SELECT id FROM members WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists. Please try logging in instead.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert member
        const result = await query(
            `INSERT INTO members (email, username, full_name, metadata) VALUES (?, ?, ?, ?)`,
            [email, username, username, JSON.stringify({
                password: hashedPassword,
                registeredVia: 'v3_app',
                registeredAt: new Date().toISOString()
            })]
        );

        const memberId = result.insertId;

        // Initialize domain memory
        await query(`INSERT INTO domain_memory (member_id, category, key_field, value) VALUES (?, 'profile', 'registration_date', ?)`, [memberId, new Date().toISOString()]);
        await query(`INSERT INTO domain_memory (member_id, category, key_field, value) VALUES (?, 'profile', 'email', ?)`, [memberId, email]);
        await query(`INSERT INTO domain_memory (member_id, category, key_field, value) VALUES (?, 'profile', 'username', ?)`, [memberId, username]);

        res.status(201).json({
            success: true,
            memberId: memberId,
            message: `Welcome to the Revolution, ${username}!`
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to complete signup.' });
    }
}
