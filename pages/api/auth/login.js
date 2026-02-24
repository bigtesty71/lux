import { query } from '../../lib/db/connection';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
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

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const members = await query('SELECT id, email, username, full_name, metadata FROM members WHERE email = ?', [email]);

        if (members.length === 0) {
            return res.status(404).json({ error: 'No account found with that email.' });
        }

        const member = members[0];
        let meta = {};
        try { meta = JSON.parse(member.metadata || '{}'); } catch (e) { }

        if (!meta.password) {
            return res.status(400).json({ error: 'Account has no password' });
        }

        const valid = await bcrypt.compare(password, meta.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.status(200).json({
            success: true,
            member: {
                id: member.id,
                email: member.email,
                username: member.username,
                full_name: member.full_name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed' });
    }
}
