import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

export function getDb(): DatabaseSync {
  return db;
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      slug TEXT UNIQUE,
      content TEXT,
      cover_image TEXT,
      author_id INTEGER,
      published_status BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      slug TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER,
      tag_id INTEGER,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      author_name TEXT,
      content TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `);

  // Migrations for existing DBs
  try { db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT \'user\''); } catch (e) { /* ok */ }
  try { db.exec('ALTER TABLE comments ADD COLUMN image_url TEXT'); } catch (e) { /* ok */ }
  try { db.exec('ALTER TABLE posts ADD COLUMN cover_image TEXT'); } catch (e) { /* ok */ }
  try { db.exec('ALTER TABLE posts ADD COLUMN author_id INTEGER REFERENCES users(id)'); } catch (e) { /* ok */ }

  // Seed admin user if not exists
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';
  const hash = bcrypt.hashSync(adminPass, 10);
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUser) as any;
  if (!existing) {
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(adminUser, hash);
    console.log(`Admin user created: ${adminUser}`);
  } else {
    db.prepare("UPDATE users SET role = 'admin' WHERE username = ? AND (role IS NULL OR role != 'admin')").run(adminUser);
  }

  // Ensure existing posts without author inherit admin as author
  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUser) as any;
  if (admin) {
    db.prepare('UPDATE posts SET author_id = ? WHERE author_id IS NULL').run(admin.id);
  }

  console.log('Database initialized');
}
