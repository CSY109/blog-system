import express from 'express';
import { getDb } from '../db/index';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  try {
    const postCount = db.prepare('SELECT count(*) as cnt FROM posts').get() as { cnt: number };
    const userCount = db.prepare('SELECT count(*) as cnt FROM users').get() as { cnt: number };
    const commentCount = db.prepare('SELECT count(*) as cnt FROM comments').get() as { cnt: number };
    const tagCount = db.prepare('SELECT count(*) as cnt FROM tags').get() as { cnt: number };
    const publishedCount = db.prepare("SELECT count(*) as cnt FROM posts WHERE published_status = 1").get() as { cnt: number };
    const pendingCommentCount = db.prepare("SELECT count(*) as cnt FROM comments WHERE status = 'pending'").get() as { cnt: number };

    const recentPosts = db.prepare(
      'SELECT id, title, slug, published_status, created_at FROM posts ORDER BY created_at DESC LIMIT 5'
    ).all();

    const recentComments = db.prepare(
      `SELECT c.id, c.author_name, c.content, c.status, c.created_at, p.title as post_title
       FROM comments c
       LEFT JOIN posts p ON c.post_id = p.id
       ORDER BY c.created_at DESC LIMIT 5`
    ).all();

    res.json({
      posts: postCount.cnt,
      publishedPosts: publishedCount.cnt,
      users: userCount.cnt,
      comments: commentCount.cnt,
      pendingComments: pendingCommentCount.cnt,
      tags: tagCount.cnt,
      recentPosts,
      recentComments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
