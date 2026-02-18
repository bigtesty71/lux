import { query } from '../../../lib/db/connection';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return handleSignup(req, res);
  }

  if (req.method === 'GET') {
    return handleGetMember(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSignup(req, res) {
  try {
    const { email, username, fullName, password } = req.body;

    console.log('Signup attempt:', { email, username });

    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({
        error: 'Email, username, and password are required'
      });
    }

    // Check if user exists
    const existing = await query(
      'SELECT id FROM members WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert member
    const result = await query(
      `INSERT INTO members (email, username, full_name, metadata)
       VALUES (?, ?, ?, ?)`,
      [email, username, fullName || null, JSON.stringify({
        password: hashedPassword,
        registeredVia: 'widget',
        registeredAt: new Date().toISOString()
      })]
    );

    // Initialize domain memory for new member
    const memberId = result.insertId;

    await query(
      `INSERT INTO domain_memory (member_id, category, key_field, value)
       VALUES (?, 'profile', 'registration_date', ?)`,
      [memberId, new Date().toISOString()]
    );

    await query(
      `INSERT INTO domain_memory (member_id, category, key_field, value)
       VALUES (?, 'profile', 'email', ?)`,
      [memberId, email]
    );

    await query(
      `INSERT INTO domain_memory (member_id, category, key_field, value)
       VALUES (?, 'profile', 'username', ?)`,
      [memberId, username]
    );

    if (fullName) {
      await query(
        `INSERT INTO domain_memory (member_id, category, key_field, value)
         VALUES (?, 'profile', 'full_name', ?)`,
        [memberId, fullName]
      );
    }

    res.status(201).json({
      success: true,
      memberId: memberId,
      message: `Welcome to the Revolution, ${fullName || username}!`
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Failed to register member',
      details: error.message
    });
  }
}

async function handleGetMember(req, res) {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    const members = await query(
      'SELECT id, email, username, full_name, subscription_tier FROM members WHERE id = ?',
      [memberId]
    );

    if (members.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const domainMemory = await query(
      'SELECT category, key_field, value FROM domain_memory WHERE member_id = ?',
      [memberId]
    );

    res.status(200).json({
      member: members[0],
      domainMemory
    });

  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
}