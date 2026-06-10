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
const index_1 = require("../db/index");
const router = express_1.default.Router();
// GET all users
router.get('/', (req, res) => {
    const db = (0, index_1.getDb)();
    try {
        const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY id').all();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST create user
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const db = (0, index_1.getDb)();
    try {
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
        res.status(201).json({ id: result.lastInsertRowid, username });
    }
    catch (error) {
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('UNIQUE')) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// PUT update user
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password } = req.body;
    const userId = parseInt(req.params.id);
    const db = (0, index_1.getDb)();
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (username) {
            db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, userId);
        }
        if (password) {
            const passwordHash = yield bcryptjs_1.default.hash(password, 10);
            db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
        }
        res.json({ message: 'User updated' });
    }
    catch (error) {
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('UNIQUE')) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// DELETE user
router.delete('/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const db = (0, index_1.getDb)();
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const { cnt } = db.prepare('SELECT count(*) as cnt FROM users').get();
        if (cnt <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last user' });
        }
        db.prepare('DELETE FROM users WHERE id = ?').run(userId);
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
