"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../db/index");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all posts (public) — with search and pagination
router.get('/', (req, res) => {
    const db = (0, index_1.getDb)();
    try {
        const { search, page = '1', limit = '10' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        let whereClause = "WHERE published_status = 1";
        const params = [];
        if (search && search.trim()) {
            whereClause += " AND (title LIKE ? OR content LIKE ?)";
            params.push(`%${search.trim()}%`, `%${search.trim()}%`);
        }
        const { cnt: total } = db.prepare(`SELECT count(*) as cnt FROM posts ${whereClause}`).get(...params);
        const posts = db.prepare(`SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);
        res.json({ data: posts, total, page: pageNum, limit: limitNum });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get all posts (admin - including unpublished)
router.get('/admin', auth_1.authMiddleware, (req, res) => {
    const db = (0, index_1.getDb)();
    try {
        const { search, page = '1', limit = '10' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        let whereClause = "WHERE 1=1";
        const params = [];
        if (search && search.trim()) {
            whereClause += " AND (title LIKE ? OR content LIKE ? OR slug LIKE ?)";
            params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
        }
        const { cnt: total } = db.prepare(`SELECT count(*) as cnt FROM posts ${whereClause}`).get(...params);
        const posts = db.prepare(`SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);
        res.json({ data: posts, total, page: pageNum, limit: limitNum });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get single post by slug (public)
router.get('/:slug', (req, res) => {
    const db = (0, index_1.getDb)();
    try {
        const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Create post (admin)
router.post('/', auth_1.authMiddleware, (req, res) => {
    const { title, slug, content, cover_image, published_status } = req.body;
    const db = (0, index_1.getDb)();
    try {
        const result = db.prepare('INSERT INTO posts (title, slug, content, cover_image, published_status) VALUES (?, ?, ?, ?, ?)').run(title, slug, content, cover_image || null, published_status ? 1 : 0);
        res.status(201).json({ id: result.lastInsertRowid });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update post (admin)
router.put('/:id', auth_1.authMiddleware, (req, res) => {
    const { title, slug, content, cover_image, published_status } = req.body;
    const db = (0, index_1.getDb)();
    try {
        db.prepare('UPDATE posts SET title = ?, slug = ?, content = ?, cover_image = COALESCE(?, cover_image), published_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, slug, content, cover_image || null, published_status ? 1 : 0, req.params.id);
        res.json({ message: 'Post updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete post (admin)
router.delete('/:id', auth_1.authMiddleware, (req, res) => {
    const db = (0, index_1.getDb)();
    try {
        db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
        res.json({ message: 'Post deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
