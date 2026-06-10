import express from 'express';
import { getDb } from '../db/index';

const router = express.Router();

// GET all tags
router.get('/', (req, res) => {
  const db = getDb();
  try {
    const tags = db.prepare('SELECT * FROM tags ORDER BY name').all();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST create tag
router.post('/', (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: 'Name and slug are required' });
  }
  const db = getDb();
  try {
    const result = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run(name, slug);
    res.status(201).json({ id: result.lastInsertRowid, name, slug });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Tag name or slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update tag
router.put('/:id', (req, res) => {
  const { name, slug } = req.body;
  const id = parseInt(req.params.id);
  const db = getDb();
  try {
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    db.prepare(
      'UPDATE tags SET name = COALESCE(?, name), slug = COALESCE(?, slug) WHERE id = ?'
    ).run(name || null, slug || null, id);
    res.json({ message: 'Tag updated' });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Tag name or slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE tag
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = getDb();
  try {
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    db.prepare('DELETE FROM post_tags WHERE tag_id = ?').run(id);
    db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET tags for a specific post
router.get('/post/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const db = getDb();
  try {
    const tags = db.prepare(
      `SELECT t.* FROM tags t
       INNER JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = ?
       ORDER BY t.name`
    ).all(postId);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST set tags for a post
router.post('/post/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { tagIds } = req.body;
  const db = getDb();
  try {
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(postId);
    if (tagIds && tagIds.length > 0) {
      const stmt = db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)');
      for (const tagId of tagIds) {
        stmt.run(postId, tagId);
      }
    }
    res.json({ message: 'Tags updated' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
