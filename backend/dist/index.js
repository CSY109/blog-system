"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const tags_1 = __importDefault(require("./routes/tags"));
const comments_1 = require("./routes/comments");
const stats_1 = __importDefault(require("./routes/stats"));
const upload_1 = __importDefault(require("./routes/upload"));
const index_1 = require("./db/index");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Public routes
app.use('/api/auth', auth_2.default);
app.use('/api/posts', posts_1.default);
app.use('/api/comments', comments_1.publicRouter);
app.use('/api/upload', upload_1.default);
// Admin routes (protected — require auth + admin role)
app.use('/api/users', auth_1.authMiddleware, auth_1.adminMiddleware, users_1.default);
app.use('/api/tags', auth_1.authMiddleware, auth_1.adminMiddleware, tags_1.default);
app.use('/api/admin/comments', auth_1.authMiddleware, auth_1.adminMiddleware, comments_1.adminRouter);
app.use('/api/stats', auth_1.authMiddleware, auth_1.adminMiddleware, stats_1.default);
app.get('/', (req, res) => {
    res.send('Blog API is running');
});
// Initialize DB and start server
try {
    (0, index_1.initDb)();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
catch (err) {
    console.error('Failed to initialize database:', err);
}
