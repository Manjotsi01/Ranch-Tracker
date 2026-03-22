"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getProfitChart = exports.getAlerts = exports.getKPIs = exports.getStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const dashboard_service_1 = __importDefault(require("../services/dashboard.service"));
exports.getStats = (0, express_async_handler_1.default)(async (req, res) => {
    const stats = await dashboard_service_1.default.getStats();
    res.json({
        success: true,
        data: stats
    });
});
exports.getKPIs = (0, express_async_handler_1.default)(async (req, res) => {
    const kpis = await dashboard_service_1.default.getKPIs();
    res.json({
        success: true,
        data: kpis
    });
});
exports.getAlerts = (0, express_async_handler_1.default)(async (req, res) => {
    const alerts = await dashboard_service_1.default.getAlerts();
    res.json({
        success: true,
        data: alerts
    });
});
exports.getProfitChart = (0, express_async_handler_1.default)(async (req, res) => {
    const { period = 'month' } = req.query;
    const chart = await dashboard_service_1.default.getProfitChart(period);
    res.json({
        success: true,
        data: chart
    });
});
exports.getRecentActivity = (0, express_async_handler_1.default)(async (req, res) => {
    const activity = await dashboard_service_1.default.getRecentActivity();
    res.json({
        success: true,
        data: activity
    });
});
