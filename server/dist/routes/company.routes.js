"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
/**
 * Rate limiter para criação de empresas
 * Previne spam de criação
 */
const createCompanyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Máximo 5 empresas por hora
    message: {
        success: false,
        message: "Muitas tentativas de criação de empresa. Tente novamente mais tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * @route   POST /api/companies
 * @desc    Cria uma nova empresa
 * @access  Public (mas cria usuário admin se não houver login)
 *
 * Lógica especial:
 * - Se usuário está logado: cria empresa e promove usuário a admin
 * - Se não está logado: cria usuário admin primeiro, depois cria empresa
 */
router.post("/", auth_middleware_1.optionalAuthenticate, createCompanyLimiter, company_controller_1.createCompany);
/**
 * @route   GET /api/companies
 * @desc    Busca todas as empresas com paginação
 * @access  Public
 * @query   page - Número da página (default: 1)
 * @query   limit - Itens por página (default: 10)
 * @query   is_active - Filtrar por status ativo (true/false)
 */
router.get("/", company_controller_1.getAllCompanies);
/**
 * @route   GET /api/companies/:id
 * @desc    Busca uma empresa por ID
 * @access  Public
 */
router.get("/:id", company_controller_1.getCompanyById);
/**
 * @route   PUT /api/companies/:id
 * @desc    Atualiza uma empresa
 * @access  Private (Admin only)
 */
router.put("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, company_controller_1.updateCompany);
/**
 * @route   DELETE /api/companies/:id
 * @desc    Deleta uma empresa
 * @access  Private (Admin only)
 */
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, company_controller_1.deleteCompany);
exports.default = router;
