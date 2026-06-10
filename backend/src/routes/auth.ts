import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

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

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
