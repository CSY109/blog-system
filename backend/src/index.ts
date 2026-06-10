import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import userRoutes from './routes/users';
import tagRoutes from './routes/tags';
import { publicRouter as publicCommentRoutes, adminRouter as adminCommentRoutes } from './routes/comments';
import statsRoutes from './routes/stats';
import { initDb } from './db/index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', publicCommentRoutes);

// Admin routes (protected)
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/tags', authMiddleware, tagRoutes);
app.use('/api/admin/comments', authMiddleware, adminCommentRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

app.get('/', (req, res) => {
  res.send('Blog API is running');
});

// Initialize DB and start server
try {
  initDb();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  console.error('Failed to initialize database:', err);
}
