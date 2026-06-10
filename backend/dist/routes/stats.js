"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../db/index");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    const db = (0, index_1.getDb)();
    try {
        const postCount = db.prepare('SELECT count(*) as cnt FROM posts').get();
        const userCount = db.prepare('SELECT count(*) as cnt FROM users').get();
        const commentCount = db.prepare('SELECT count(*) as cnt FROM comments').get();
        const tagCount = db.prepare('SELECT count(*) as cnt FROM tags').get();
        const publishedCount = db.prepare("SELECT count(*) as cnt FROM posts WHERE published_status = 1").get();
        const pendingCommentCount = db.prepare("SELECT count(*) as cnt FROM comments WHERE status = 'pending'").get();
        const recentPosts = db.prepare('SELECT id, title, slug, published_status, created_at FROM posts ORDER BY created_at DESC LIMIT 5').all();
        const recentComments = db.prepare(`SELECT c.id, c.author_name, c.content, c.status, c.created_at, p.title as post_title
       FROM comments c
       LEFT JOIN posts p ON c.post_id = p.id
       ORDER BY c.created_at DESC LIMIT 5`).all();
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
