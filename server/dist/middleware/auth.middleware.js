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
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.requireAdmin = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
/**
 * Middleware que verifica se o usuário está autenticado
 * Checks Authorization header only
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = (0, jwt_utils_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Token de autenticação não fornecido",
            });
            return;
        }
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        // Adiciona os dados do usuário à requisição
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Token inválido ou expirado",
        });
    }
});
exports.authenticate = authenticate;
/**
 * Middleware que verifica se o usuário é admin ou owner
 * Admin e owner agora são equivalentes - ambos podem gerenciar empresas
 */
const requireAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Usuário não autenticado",
        });
        return;
    }
    // Aceita tanto admin quanto vendor (vendor pode gerenciar seus produtos/empresa)
    // TODO: Refinar permissões específicas se necessário
    if (req.user.role !== "admin" && req.user.role !== "vendor") {
        res.status(403).json({
            success: false,
            message: "Acesso negado. Apenas administradores ou vendedores podem acessar este recurso",
        });
        return;
    }
    next();
});
exports.requireAdmin = requireAdmin;
/**
 * Middleware opcional - não retorna erro se não houver tokens
 */
const optionalAuthenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = (0, jwt_utils_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        }
    }
    catch (error) {
        // Ignora erros de token em autenticação opcional
    }
    next();
});
exports.optionalAuthenticate = optionalAuthenticate;
