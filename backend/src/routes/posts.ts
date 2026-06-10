import express from 'express';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ── NOTE: specific routes MUST come before parametric (:slug / :id) ──

// ── Authenticated — my posts ───────────────────────────
router.get('/my/all', authMiddleware, (req: any, res) => {
  const db = getDb();
  try {
    const { search, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let where = "WHERE author_id = ?";
    const params: any[] = [req.user.id];

    if (search && search.trim()) {
      where += " AND (title LIKE ? OR content LIKE ? OR slug LIKE ?)";
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    const { cnt: total } = db.prepare(`SELECT count(*) as cnt FROM posts ${where}`).get(...params) as { cnt: number };
    const data = db.prepare(`SELECT * FROM posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Admin — all posts incl unpublished ─────────────────
router.get('/admin/all', authMiddleware, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const db = getDb();
  try {
    const { search, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let where = "WHERE 1=1";
    const params: any[] = [];

    if (search && search.trim()) {
      where += " AND (title LIKE ? OR content LIKE ? OR slug LIKE ?)";
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    const { cnt: total } = db.prepare(`SELECT count(*) as cnt FROM posts ${where}`).get(...params) as { cnt: number };
    const data = db.prepare(`SELECT * FROM posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Get single post for editing (author or admin) ──────
router.get('/edit/:id', authMiddleware, (req: any, res) => {
  const db = getDb();
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as any;
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only author or admin can view the post for editing
    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Public — GET all published ─────────────────────────
router.get('/', (req, res) => {
  const db = getDb();
  try {
    const { search, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let where = "WHERE published_status = 1";
    const params: any[] = [];

    if (search && search.trim()) {
      where += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const { cnt: total } = db.prepare(`SELECT count(*) as cnt FROM posts ${where}`).get(...params) as { cnt: number };
    const data = db.prepare(`SELECT * FROM posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Public — get post by slug ──────────────────────────
router.get('/:slug', (req, res) => {
  const db = getDb();
  try {
    const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Authenticated — create post ────────────────────────
router.post('/', authMiddleware, (req: any, res) => {
  const { title, slug, content, cover_image, published_status } = req.body;
  const db = getDb();
  try {
    const result = db.prepare(
      'INSERT INTO posts (title, slug, content, cover_image, author_id, published_status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, slug, content, cover_image || null, req.user.id, published_status ? 1 : 0);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Authenticated — update post (author or admin) ──────
router.put('/:id', authMiddleware, (req: any, res) => {
  const { title, slug, content, cover_image, published_status } = req.body;
  const db = getDb();
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as any;
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    // If cover_image is explicitly sent (including null), use it; else keep existing
    const finalCover = 'cover_image' in req.body ? (cover_image || null) : (post.cover_image || null);

    db.prepare(
      'UPDATE posts SET title=?, slug=?, content=?, cover_image=?, published_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(title, slug, content, finalCover, published_status ? 1 : 0, req.params.id);
    res.json({ message: 'Post updated' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ── Authenticated — delete post (author or admin) ─────
router.delete('/:id', authMiddleware, (req: any, res) => {
  const db = getDb();
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as any;
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
