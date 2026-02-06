"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromHeader = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokenPair = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Gera um par de tokens (access + refresh)
 */
const generateTokenPair = (payload) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
        throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables");
    }
    const accessTokenOptions = {
        expiresIn: JWT_EXPIRES_IN,
    };
    const refreshTokenOptions = {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, accessTokenOptions);
    const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, JWT_REFRESH_SECRET, refreshTokenOptions);
    return { accessToken, refreshToken };
};
exports.generateTokenPair = generateTokenPair;
/**
 * Verifica e decodifica um access token
 */
const verifyAccessToken = (token) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET must be defined in environment variables");
    }
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error("Token inválido ou expirado");
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verifica e decodifica um refresh token
 */
const verifyRefreshToken = (token) => {
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    if (!JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET must be defined in environment variables");
    }
    try {
        return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    }
    catch (error) {
        throw new Error("Refresh token inválido ou expirado");
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Extrai o token do header Authorization
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.substring(7);
};
exports.extractTokenFromHeader = extractTokenFromHeader;
