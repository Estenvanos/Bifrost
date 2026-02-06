"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
/**
 * Rate limiter para criação de produtos
 */
const createProductLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // Máximo 20 produtos por hora
    message: {
        success: false,
        message: "Muitas tentativas de criação de produto. Tente novamente mais tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * @route   POST /api/products
 * @desc    Cria um novo produto (usa company_id do usuário logado)
 * @access  Private (Admin only + must have company)
 */
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, createProductLimiter, product_controller_1.createProduct);
/**
 * @route   GET /api/products
 * @desc    Busca todos os produtos com paginação e filtros
 * @access  Public
 */
router.get("/", product_controller_1.getAllProducts);
/**
 * @route   GET /api/products/:id
 * @desc    Busca um produto por ID
 * @access  Public
 */
router.get("/:id", product_controller_1.getProductById);
/**
 * @route   PUT /api/products/:id
 * @desc    Atualiza um produto (apenas da própria empresa)
 * @access  Private (Admin only + same company)
 */
router.put("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, product_controller_1.updateProduct);
/**
 * @route   DELETE /api/products/:id
 * @desc    Deleta um produto (apenas da própria empresa)
 * @access  Private (Admin only + same company)
 */
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, product_controller_1.deleteProduct);
exports.default = router;
