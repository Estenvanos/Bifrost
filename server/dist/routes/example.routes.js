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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Exemplo de rota protegida - apenas usuários autenticados
 */
router.get("/profile", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        success: true,
        message: "Acesso permitido",
        user: req.user,
    });
}));
/**
 * Exemplo de rota admin - apenas administradores
 */
router.get("/admin/users", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Aqui você pode listar todos os usuários, etc.
    res.status(200).json({
        success: true,
        message: "Acesso admin permitido",
        admin: req.user,
    });
}));
/**
 * Exemplo de rota que aceita tanto usuários autenticados quanto não autenticados
 */
router.get("/public-content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = req.user
        ? `Olá ${req.user.email}, conteúdo personalizado!`
        : "Conteúdo público para visitantes";
    res.status(200).json({
        success: true,
        message,
        isAuthenticated: !!req.user,
    });
}));
exports.default = router;
