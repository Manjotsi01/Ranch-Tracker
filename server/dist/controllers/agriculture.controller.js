"use strict";
// Path: ranch-tracker/server/src/controllers/agriculture.controller.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteYieldHandler = exports.addYieldHandler = exports.getYieldsHandler = exports.deleteResourceHandler = exports.addResourceHandler = exports.getResourcesHandler = exports.deleteExpenseHandler = exports.addExpenseHandler = exports.getExpensesHandler = exports.deleteSeasonHandler = exports.updateSeasonHandler = exports.getSeasonHandler = exports.getSeasonsHandler = exports.createSeasonHandler = exports.getCropSeasonsHandler = exports.getCropHandler = exports.getAllCropsHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_1 = require("../utils/response");
const agricultureService = __importStar(require("../services/agriculture.service"));
// ─── Crops ────────────────────────────────────────────────────────────────────
exports.getAllCropsHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const crops = await agricultureService.getAllCrops();
    (0, response_1.sendSuccess)(res, crops);
});
// GET /agriculture/crops/:cropId → single crop details
exports.getCropHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const crop = await agricultureService.getCropById(req.params.cropId);
    (0, response_1.sendSuccess)(res, crop);
});
// GET /agriculture/crops/:cropId/seasons → seasons for a crop
exports.getCropSeasonsHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const seasons = await agricultureService.getCropSeasons(req.params.cropId);
    (0, response_1.sendSuccess)(res, seasons);
});
// ─── Seasons ──────────────────────────────────────────────────────────────────
// POST /agriculture/seasons
exports.createSeasonHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const season = await agricultureService.createSeason(req.body);
    (0, response_1.sendSuccess)(res, season, 201);
});
// GET /agriculture/seasons
exports.getSeasonsHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const seasons = await agricultureService.getSeasons();
    (0, response_1.sendSuccess)(res, seasons);
});
// ✅ FIX 2: GET /agriculture/seasons/:id — used by SeasonDetail on load
exports.getSeasonHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const season = await agricultureService.getSeasonById(req.params.id);
    (0, response_1.sendSuccess)(res, season);
});
// ✅ PUT /agriculture/seasons/:id — used by ManageTab status change
exports.updateSeasonHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const season = await agricultureService.updateSeason(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, season);
});
// ✅ DELETE /agriculture/seasons/:id — used by Delete Season button
exports.deleteSeasonHandler = (0, express_async_handler_1.default)(async (req, res) => {
    await agricultureService.deleteSeason(req.params.id);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
// ─── Expenses ─────────────────────────────────────────────────────────────────
// ✅ GET /agriculture/seasons/:id/expenses
exports.getExpensesHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const expenses = await agricultureService.getExpenses(req.params.id);
    (0, response_1.sendSuccess)(res, expenses);
});
// ✅ POST /agriculture/seasons/:id/expenses
exports.addExpenseHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const expense = await agricultureService.addExpenseToSeason(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, expense, 201);
});
// ✅ DELETE /agriculture/seasons/:id/expenses/:expenseId
exports.deleteExpenseHandler = (0, express_async_handler_1.default)(async (req, res) => {
    await agricultureService.deleteExpense(req.params.id, req.params.expenseId);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
// ─── Resources ────────────────────────────────────────────────────────────────
// ✅ GET /agriculture/seasons/:id/resources
exports.getResourcesHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const resources = await agricultureService.getResources(req.params.id);
    (0, response_1.sendSuccess)(res, resources);
});
// ✅ POST /agriculture/seasons/:id/resources
exports.addResourceHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const resource = await agricultureService.addResource(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, resource, 201);
});
// ✅ DELETE /agriculture/seasons/:id/resources/:resourceId
exports.deleteResourceHandler = (0, express_async_handler_1.default)(async (req, res) => {
    await agricultureService.deleteResource(req.params.id, req.params.resourceId);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
// ─── Yields ───────────────────────────────────────────────────────────────────
// ✅ GET /agriculture/seasons/:id/yields
exports.getYieldsHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const yields = await agricultureService.getYields(req.params.id);
    (0, response_1.sendSuccess)(res, yields);
});
// ✅ POST /agriculture/seasons/:id/yields
exports.addYieldHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const yieldRecord = await agricultureService.addYieldToSeason(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, yieldRecord, 201);
});
// ✅ DELETE /agriculture/seasons/:id/yields/:yieldId
exports.deleteYieldHandler = (0, express_async_handler_1.default)(async (req, res) => {
    await agricultureService.deleteYield(req.params.id, req.params.yieldId);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
