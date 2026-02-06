"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.updateProfileSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// Validation schemas
const loginSchema = zod_1.default.object({
    email: zod_1.default.string().email('Invalid email address'),
    password: zod_1.default.string().min(1, 'Password is required'),
});
exports.loginSchema = loginSchema;
const registerSchema = zod_1.default.object({
    username: zod_1.default.string().min(3, 'Username must be at least 3 characters'),
    email: zod_1.default.string().email('Invalid email address'),
    password: zod_1.default.string().min(6, 'Password must be at least 6 characters'),
});
exports.registerSchema = registerSchema;
const updateProfileSchema = zod_1.default.object({
    username: zod_1.default.string().min(3, 'Username must be at least 3 characters').optional(),
    email: zod_1.default.string().email('Invalid email address').optional(),
    password: zod_1.default.string().min(6, 'Password must be at least 6 characters').optional(),
});
exports.updateProfileSchema = updateProfileSchema;
const updateUserSchema = zod_1.default.object({
    username: zod_1.default.string().min(3, 'Username must be at least 3 characters').optional(),
    email: zod_1.default.string().email('Invalid email address').optional(),
    type: zod_1.default.enum(['customer', 'admin']).optional(),
});
exports.updateUserSchema = updateUserSchema;
