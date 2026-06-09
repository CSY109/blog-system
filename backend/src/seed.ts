import bcrypt from 'bcryptjs';
import { getDb, initDb } from './db/index';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  await initDb();
  const db = await getDb();

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.run(
      'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
    console.log(`Admin user seeded: ${username}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    process.exit();
  }
}

seed();
