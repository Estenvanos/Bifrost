"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/signup
 * @desc    Registra um novo usuário
 * @access  Public
 */
router.post("/signup", rateLimit_middleware_1.signupLimiter, auth_controller_1.signup);
/**
 * @route   POST /api/auth/signin
 * @desc    Faz login do usuário
 * @access  Public
 */
router.post("/signin", rateLimit_middleware_1.authLimiter, auth_controller_1.signin);
/**
 * @route   POST /api/auth/logout
 * @desc    Faz logout do usuário (limpa cookies)
 * @access  Public
 */
router.post("/logout", auth_controller_1.logout);
/**
 * @route   GET /api/auth/me
 * @desc    Retorna os dados do usuário autenticado
 * @access  Private
 */
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.getMe);
/**
 * @route   POST /api/auth/refresh
 * @desc    Atualiza o access token usando refresh token
 * @access  Public
 */
router.post("/refresh", auth_controller_1.refreshToken);
/**
 * @route   PUT /api/auth/change-password
 * @desc    Altera a senha do usuário
 * @access  Private
 */
router.put("/change-password", auth_middleware_1.authenticate, auth_controller_1.changePassword);
exports.default = router;
