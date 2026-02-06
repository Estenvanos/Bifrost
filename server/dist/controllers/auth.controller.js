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
exports.changePassword = exports.logout = exports.refreshToken = exports.getMe = exports.signin = exports.signup = void 0;
const User_1 = require("../models/User");
const password_utils_1 = require("../utils/password.utils");
const validation_utils_1 = require("../utils/validation.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.env.nodeEnv === "production",
    sameSite: env_1.env.nodeEnv === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
/**
 * Registra um novo usuário
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, firstName, lastName } = req.body;
        // Validação de campos obrigatórios
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email e senha são obrigatórios",
            });
            return;
        }
        // Valida email
        const emailValidation = (0, validation_utils_1.validateEmail)(email);
        if (!emailValidation.isValid) {
            res.status(400).json({
                success: false,
                message: emailValidation.error,
            });
            return;
        }
        // Valida força da senha
        const passwordValidation = (0, password_utils_1.validatePasswordStrength)(password);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: "Senha fraca",
                errors: passwordValidation.errors,
            });
            return;
        }
        // Verifica se o email já existe
        const existingUser = yield User_1.User.findOne({
            email: emailValidation.sanitized
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Email já cadastrado",
            });
            return;
        }
        // Hash da senha
        const hashedPassword = yield (0, password_utils_1.hashPassword)(password);
        // Cria o usuário
        // Default role is customer if not specified or invalid (handled by enum in schema, but good to be explicit)
        const newUser = yield User_1.User.create({
            email: emailValidation.sanitized,
            password: hashedPassword,
            role: role || "customer",
            firstName,
            lastName
        });
        // Gera tokens
        const tokens = (0, jwt_utils_1.generateTokenPair)({
            userId: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role,
        });
        // Store refresh token in Redis
        yield redis_1.redis.set(`session:${newUser._id}`, tokens.refreshToken, "EX", 7 * 24 * 60 * 60);
        // Set refresh token cookie
        res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
        // Remove a senha da resposta
        const userResponse = {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            createdAt: newUser.createdAt,
        };
        res.status(201).json({
            success: true,
            message: "Usuário criado com sucesso",
            data: {
                user: userResponse,
                accessToken: tokens.accessToken,
            },
        });
    }
    catch (error) {
        console.error("Erro no signup:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar usuário",
        });
    }
});
exports.signup = signup;
/**
 * Faz login do usuário
 */
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validação de campos obrigatórios
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email e senha são obrigatórios",
            });
            return;
        }
        // Valida formato do email
        const emailValidation = (0, validation_utils_1.validateEmail)(email);
        if (!emailValidation.isValid) {
            res.status(400).json({
                success: false,
                message: emailValidation.error,
            });
            return;
        }
        // Busca o usuário
        const user = yield User_1.User.findOne({
            email: emailValidation.sanitized
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Email ou senha incorretos",
            });
            return;
        }
        // Verifica a senha
        const isPasswordValid = yield (0, password_utils_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Email ou senha incorretos",
            });
            return;
        }
        // Gera tokens
        const tokens = (0, jwt_utils_1.generateTokenPair)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        // Store refresh token in Redis
        yield redis_1.redis.set(`session:${user._id}`, tokens.refreshToken, "EX", 7 * 24 * 60 * 60);
        // Set refresh token cookie
        res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
        // Remove a senha da resposta
        const userResponse = {
            _id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
        };
        res.status(200).json({
            success: true,
            message: "Login realizado com sucesso",
            data: {
                user: userResponse,
                accessToken: tokens.accessToken,
            },
        });
    }
    catch (error) {
        console.error("Erro no signin:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao fazer login",
        });
    }
});
exports.signin = signin;
/**
 * Retorna os dados do usuário autenticado
 */
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuário não autenticado",
            });
            return;
        }
        const user = yield User_1.User.findById(req.user.userId).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar dados do usuário",
        });
    }
});
exports.getMe = getMe;
/**
 * Atualiza o access token usando o refresh token
 */
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh token é obrigatório",
            });
            return;
        }
        // Verifica o refresh token JWT
        const decoded = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
        // Verifica se o token está no Redis (sessão ativa)
        const storedToken = yield redis_1.redis.get(`session:${decoded.userId}`);
        // Optional: Check if storedToken matches incoming token to detect theft?
        // For now, simple presence check + valid JWT.
        if (!storedToken) {
            res.status(401).json({
                success: false,
                message: "Sessão expirada",
            });
            return;
        }
        // Busca o usuário
        const user = yield User_1.User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
            return;
        }
        // Gera novo par de tokens
        const tokens = (0, jwt_utils_1.generateTokenPair)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        // Rotate refresh token in Redis
        yield redis_1.redis.set(`session:${user._id}`, tokens.refreshToken, "EX", 7 * 24 * 60 * 60);
        // Set cookie
        res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
        res.status(200).json({
            success: true,
            message: "Token atualizado com sucesso",
            data: { accessToken: tokens.accessToken },
        });
    }
    catch (error) {
        console.error("Erro ao atualizar token:", error);
        res.status(401).json({
            success: false,
            message: "Refresh token inválido ou expirado",
        });
    }
});
exports.refreshToken = refreshToken;
/**
 * Faz logout do usuário
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("refreshToken");
        if (req.user) {
            yield redis_1.redis.del(`session:${req.user.userId}`);
        }
        res.status(200).json({
            success: true,
            message: "Logout realizado com sucesso",
        });
    }
    catch (error) {
        console.error("Erro no logout:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao fazer logout",
        });
    }
});
exports.logout = logout;
/**
 * Altera a senha do usuário autenticado
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuário não autenticado",
            });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: "Senha atual e nova senha são obrigatórias",
            });
            return;
        }
        // Valida força da nova senha
        const passwordValidation = (0, password_utils_1.validatePasswordStrength)(newPassword);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: "Nova senha fraca",
                errors: passwordValidation.errors,
            });
            return;
        }
        // Busca o usuário
        const user = yield User_1.User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
            return;
        }
        // Verifica a senha atual
        const isPasswordValid = yield (0, password_utils_1.comparePassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Senha atual incorreta",
            });
            return;
        }
        // Hash da nova senha
        const hashedPassword = yield (0, password_utils_1.hashPassword)(newPassword);
        // Atualiza a senha
        yield User_1.User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
        });
        // Invalidate sessions
        yield redis_1.redis.del(`session:${user._id}`);
        res.clearCookie("refreshToken");
        res.status(200).json({
            success: true,
            message: "Senha alterada com sucesso. Faça login novamente.",
        });
    }
    catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao alterar senha",
        });
    }
});
exports.changePassword = changePassword;
