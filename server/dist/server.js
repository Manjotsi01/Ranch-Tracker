"use strict";
// Path: ranch-tracker/server/src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const agriculture_routes_1 = __importDefault(require("./routes/agriculture.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const dairy_routes_1 = __importDefault(require("./routes/dairy.routes"));
const shop_routes_1 = __importDefault(require("./routes/shop.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// ─── Config from .env ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const BASE_API = process.env.BASE_API || '/api';
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Routes — all under BASE_API ─────────────────────────────────────────────
app.use(`${BASE_API}/dashboard`, dashboard_routes_1.default);
app.use(`${BASE_API}/agriculture`, agriculture_routes_1.default);
app.use(`${BASE_API}/dairy`, dairy_routes_1.default);
app.use(`${BASE_API}/shop`, shop_routes_1.default);
// Health check — useful for uptime monitoring / Docker health checks
app.get(`${BASE_API}/health`, (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});
// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
    await (0, db_1.connectDB)();
    app.listen(PORT, () => {
        logger_1.default.info(`✅ Server running on http://localhost:${PORT}`);
        logger_1.default.info(`✅ API base: http://localhost:${PORT}${BASE_API}`);
        logger_1.default.info(`✅ MongoDB: ${process.env.MONGO_URI}`);
    });
};
startServer();
exports.default = app;
