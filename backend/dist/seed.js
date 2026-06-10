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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("./db/index");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, index_1.initDb)();
        const db = (0, index_1.getDb)();
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'password123';
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        try {
            db.prepare("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username, passwordHash);
            console.log(`Admin user seeded: ${username}`);
        }
        catch (error) {
            console.error('Error seeding admin user:', error);
        }
        finally {
            process.exit();
        }
    });
}
seed();
