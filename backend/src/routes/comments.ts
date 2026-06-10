import express from 'express';
import { getDb } from '../db/index';

const publicRouter = express.Router();
const adminRouter = express.Router();

// PUBLIC: GET approved comments for a post by slug
publicRouter.get('/post/:slug', (req, res) => {
  const db = getDb();
  try {
    const post = db.prepare('SELECT id FROM posts WHERE slug = ?').get(req.params.slug) as any;
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = db.prepare(
      `SELECT id, author_name, content, created_at
       FROM comments
       WHERE post_id = ? AND status = 'approved'
       ORDER BY created_at DESC`
    ).all(post.id);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUBLIC: Submit a comment
publicRouter.post('/', (req, res) => {
  const { post_id, author_name, content } = req.body;
  if (!post_id || !author_name || !content) {
    return res.status(400).json({ message: 'post_id, author_name, and content are required' });
  }
  const db = getDb();
  try {
    const result = db.prepare(
      'INSERT INTO comments (post_id, author_name, content, status) VALUES (?, ?, ?, ?)'
    ).run(post_id, author_name, content, 'pending');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Comment submitted for review' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN: GET all comments (with optional filters)
adminRouter.get('/', (req, res) => {
  const db = getDb();
  try {
    const { post_id, status } = req.query;
    let sql = `
      SELECT c.*, p.title as post_title, p.slug as post_slug
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (post_id) {
      sql += ' AND c.post_id = ?';
      params.push(post_id);
    }
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY c.created_at DESC';
    const comments = db.prepare(sql).all(...params);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN: Update comment status
adminRouter.put('/:id', (req, res) => {
  const { status } = req.body;
  const id = parseInt(req.params.id);

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be: approved, rejected, or pending' });
  }

  const db = getDb();
  try {
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: `Comment ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN: Delete comment
adminRouter.delete('/:id', (req, res) => {
  const db = getDb();
  try {
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { publicRouter, adminRouter };
