import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { authMiddleware, adminMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import userRoutes from './routes/users';
import tagRoutes from './routes/tags';
import { publicRouter as publicCommentRoutes, adminRouter as adminCommentRoutes } from './routes/comments';
import statsRoutes from './routes/stats';
import uploadRoutes from './routes/upload';
import { initDb } from './db/index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', publicCommentRoutes);
app.use('/api/upload', uploadRoutes);

// Admin routes (protected — require auth + admin role)
app.use('/api/users', authMiddleware, adminMiddleware, userRoutes);
app.use('/api/tags', authMiddleware, adminMiddleware, tagRoutes);
app.use('/api/admin/comments', authMiddleware, adminMiddleware, adminCommentRoutes);
app.use('/api/stats', authMiddleware, adminMiddleware, statsRoutes);

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
