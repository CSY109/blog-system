"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_js_1 = require("./db/index.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function seed() {
    await (0, index_js_1.initDb)();
    const db = await (0, index_js_1.getDb)();
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'password123';
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    try {
        await db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
        console.log(`Admin user seeded: ${username}`);
    }
    catch (error) {
        console.error('Error seeding admin user:', error);
    }
    finally {
        process.exit();
    }
}
seed();
