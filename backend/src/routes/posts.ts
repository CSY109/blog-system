import express from 'express';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all posts (public)
router.get('/', async (req, res) => {
  const db = await getDb();
  try {
    const posts = await db.all('SELECT * FROM posts WHERE published_status = 1 ORDER BY created_at DESC');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all posts (admin - including unpublished)
router.get('/admin', authMiddleware, async (req, res) => {
  const db = await getDb();
  try {
    const posts = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single post by slug (public)
router.get('/:slug', async (req, res) => {
  const db = await getDb();
  try {
    const post = await db.get('SELECT * FROM posts WHERE slug = ?', [req.params.slug]);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create post (admin)
router.post('/', authMiddleware, async (req, res) => {
  const { title, slug, content, published_status } = req.body;
  const db = await getDb();
  try {
    const result = await db.run(
      'INSERT INTO posts (title, slug, content, published_status) VALUES (?, ?, ?, ?)',
      [title, slug, content, published_status ? 1 : 0]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update post (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, slug, content, published_status } = req.body;
  const db = await getDb();
  try {
    await db.run(
      'UPDATE posts SET title = ?, slug = ?, content = ?, published_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, slug, content, published_status ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Post updated' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  try {
    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
