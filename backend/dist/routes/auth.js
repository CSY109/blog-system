"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../db/index");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';
// POST login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const db = (0, index_1.getDb)();
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role || 'user' },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// POST register (public — new users get role 'user')
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (username.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const db = (0, index_1.getDb)();
    try {
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        const result = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')").run(username, passwordHash);
        const token = jsonwebtoken_1.default.sign({ id: result.lastInsertRowid, username, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            token,
            user: { id: result.lastInsertRowid, username, role: 'user' },
        });
    }
    catch (error) {
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('UNIQUE')) {
            return res.status(409).json({ message: 'Username already taken' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
