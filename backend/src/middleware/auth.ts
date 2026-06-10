import jwt from 'jsonwebtoken';
import { type Response, type NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

// Any authenticated user can pass
export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Only admin users can pass — chain this after authMiddleware
export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
