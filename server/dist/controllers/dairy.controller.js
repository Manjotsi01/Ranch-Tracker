"use strict";
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
exports.updateFodderStock = exports.createFodderStock = exports.getFodderStock = exports.updateFodderCrop = exports.createFodderCrop = exports.getFodderCrops = exports.getProfitability = exports.upsertFeedingPlan = exports.createFeedRecord = exports.getFeeding = exports.updateTreatment = exports.createTreatment = exports.updateVaccination = exports.createVaccination = exports.getHealth = exports.createCalving = exports.updateAIRecord = exports.createAIRecord = exports.getReproduction = exports.updateLactation = exports.createLactation = exports.getLactations = exports.deleteMilkRecord = exports.createMilkRecord = exports.getMilkSummary = exports.getMilkRecords = exports.deleteAnimal = exports.updateAnimal = exports.createAnimal = exports.getAnimal = exports.getAnimals = exports.getHerdSummary = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_1 = require("../utils/response");
const svc = __importStar(require("../services/dairy.service"));
// ── Herd ──────────────────────────────────────────────────────────────────────
exports.getHerdSummary = (0, express_async_handler_1.default)(async (_req, res) => {
    const data = await svc.getHerdSummary();
    (0, response_1.sendSuccess)(res, data);
});
// ── Animals ───────────────────────────────────────────────────────────────────
exports.getAnimals = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getAnimals(req.query);
    (0, response_1.sendSuccess)(res, data);
});
exports.getAnimal = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getAnimalById(req.params.id);
    if (!data)
        return (0, response_1.sendError)(res, 'Animal not found', 404);
    (0, response_1.sendSuccess)(res, data);
});
exports.createAnimal = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createAnimal(req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateAnimal = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateAnimal(req.params.id, req.body);
    if (!data)
        return (0, response_1.sendError)(res, 'Animal not found', 404);
    (0, response_1.sendSuccess)(res, data);
});
exports.deleteAnimal = (0, express_async_handler_1.default)(async (req, res) => {
    await svc.deleteAnimal(req.params.id);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
// ── Milk ──────────────────────────────────────────────────────────────────────
exports.getMilkRecords = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getMilkRecords(req.params.id, req.query);
    (0, response_1.sendSuccess)(res, data);
});
exports.getMilkSummary = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getMilkSummary(req.params.id, req.query);
    (0, response_1.sendSuccess)(res, data);
});
exports.createMilkRecord = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createMilkRecord(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.deleteMilkRecord = (0, express_async_handler_1.default)(async (req, res) => {
    await svc.deleteMilkRecord(req.params.id, req.params.recordId);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
// ── Lactations ────────────────────────────────────────────────────────────────
exports.getLactations = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getLactations(req.params.id);
    (0, response_1.sendSuccess)(res, data);
});
exports.createLactation = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createLactation(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateLactation = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateLactation(req.params.id, req.params.lacId, req.body);
    (0, response_1.sendSuccess)(res, data);
});
// ── Reproduction ──────────────────────────────────────────────────────────────
exports.getReproduction = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getReproduction(req.params.id);
    (0, response_1.sendSuccess)(res, data);
});
exports.createAIRecord = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createAIRecord(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateAIRecord = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateAIRecord(req.params.id, req.params.aiId, req.body);
    (0, response_1.sendSuccess)(res, data);
});
exports.createCalving = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createCalving(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
// ── Health ────────────────────────────────────────────────────────────────────
exports.getHealth = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getHealth(req.params.id);
    (0, response_1.sendSuccess)(res, data);
});
exports.createVaccination = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createVaccination(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateVaccination = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateVaccination(req.params.id, req.params.vId, req.body);
    (0, response_1.sendSuccess)(res, data);
});
exports.createTreatment = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createTreatment(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateTreatment = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateTreatment(req.params.id, req.params.tId, req.body);
    (0, response_1.sendSuccess)(res, data);
});
// ── Feeding ───────────────────────────────────────────────────────────────────
exports.getFeeding = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getFeeding(req.params.id);
    (0, response_1.sendSuccess)(res, data);
});
exports.createFeedRecord = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createFeedRecord(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.upsertFeedingPlan = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.upsertFeedingPlan(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data);
});
// ── Profitability ─────────────────────────────────────────────────────────────
exports.getProfitability = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.getProfitability(req.params.id, req.query);
    (0, response_1.sendSuccess)(res, data);
});
// ── Fodder ────────────────────────────────────────────────────────────────────
exports.getFodderCrops = (0, express_async_handler_1.default)(async (_req, res) => {
    const data = await svc.getFodderCrops();
    (0, response_1.sendSuccess)(res, data);
});
exports.createFodderCrop = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createFodderCrop(req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateFodderCrop = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateFodderCrop(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data);
});
exports.getFodderStock = (0, express_async_handler_1.default)(async (_req, res) => {
    const data = await svc.getFodderStock();
    (0, response_1.sendSuccess)(res, data);
});
exports.createFodderStock = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.createFodderStock(req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateFodderStock = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await svc.updateFodderStock(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data);
});
