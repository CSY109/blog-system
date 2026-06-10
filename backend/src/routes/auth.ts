import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role || 'user' },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST register (public — new users get role 'user')
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const db = getDb();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')"
    ).run(username, passwordHash);

    const token = jwt.sign(
      { id: result.lastInsertRowid, username, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, username, role: 'user' },
    });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
