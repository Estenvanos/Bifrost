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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");
/**
 * Gera hash seguro da senha
 */
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(password, SALT_ROUNDS);
});
exports.hashPassword = hashPassword;
/**
 * Compara senha com hash
 */
const comparePassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hash);
});
exports.comparePassword = comparePassword;
/**
 * Valida força da senha
 */
const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push("A senha deve ter no mínimo 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("A senha deve conter pelo menos uma letra minúscula");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("A senha deve conter pelo menos um número");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("A senha deve conter pelo menos um caractere especial");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
};
exports.validatePasswordStrength = validatePasswordStrength;
