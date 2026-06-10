import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index';

const router = express.Router();

// GET all users
router.get('/', (req, res) => {
  const db = getDb();
  try {
    const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY id').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST create user
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  const db = getDb();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    ).run(username, passwordHash);
    res.status(201).json({ id: result.lastInsertRowid, username });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  const { username, password } = req.body;
  const userId = parseInt(req.params.id);
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, userId);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
    }
    res.json({ message: 'User updated' });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE user
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { cnt } = db.prepare('SELECT count(*) as cnt FROM users').get() as { cnt: number };
    if (cnt <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last user' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
