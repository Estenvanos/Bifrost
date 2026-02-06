"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = exports.validateUsername = exports.validateEmail = void 0;
const validator_1 = __importDefault(require("validator"));
/**
 * Valida e sanitiza email
 */
const validateEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (!validator_1.default.isEmail(trimmed)) {
        return {
            isValid: false,
            sanitized: trimmed,
            error: "Email inválido",
        };
    }
    return {
        isValid: true,
        sanitized: validator_1.default.normalizeEmail(trimmed) || trimmed,
    };
};
exports.validateEmail = validateEmail;
/**
 * Valida e sanitiza username
 */
const validateUsername = (username) => {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
        return {
            isValid: false,
            sanitized: trimmed,
            error: "Username deve ter no mínimo 3 caracteres",
        };
    }
    if (trimmed.length > 30) {
        return {
            isValid: false,
            sanitized: trimmed,
            error: "Username deve ter no máximo 30 caracteres",
        };
    }
    // Permite apenas letras, números, underscore e hífen
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return {
            isValid: false,
            sanitized: trimmed,
            error: "Username deve conter apenas letras, números, underscore e hífen",
        };
    }
    return {
        isValid: true,
        sanitized: trimmed,
    };
};
exports.validateUsername = validateUsername;
/**
 * Sanitiza string removendo caracteres perigosos
 */
const sanitizeString = (str) => {
    return validator_1.default.escape(str.trim());
};
exports.sanitizeString = sanitizeString;
