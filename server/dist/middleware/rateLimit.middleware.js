"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.signupLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate limiter para rotas de autenticação
 * Previne ataques de força bruta
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 tentativas
    message: {
        success: false,
        message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Rate limiter para criação de contas
 */
exports.signupLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Máximo 3 contas por hora
    message: {
        success: false,
        message: "Muitas tentativas de criação de conta. Tente novamente mais tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Rate limiter geral para API
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requisições
    message: {
        success: false,
        message: "Muitas requisições. Tente novamente em 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
