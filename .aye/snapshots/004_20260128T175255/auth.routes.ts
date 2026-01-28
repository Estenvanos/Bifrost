import { Router } from "express";
import {
  signup,
  signin,
  getMe,
  refreshToken,
  changePassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authLimiter, signupLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Registra um novo usuário
 * @access  Public
 */
router.post("/signup", signupLimiter, signup);

/**
 * @route   POST /api/auth/signin
 * @desc    Faz login do usuário
 * @access  Public
 */
router.post("/signin", authLimiter, signin);

/**
 * @route   GET /api/auth/me
 * @desc    Retorna os dados do usuário autenticado
 * @access  Private
 */
router.get("/me", authenticate, getMe);

/**
 * @route   POST /api/auth/refresh
 * @desc    Atualiza o access token usando refresh token
 * @access  Public
 */
router.post("/refresh", refreshToken);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Altera a senha do usuário
 * @access  Private
 */
router.put("/change-password", authenticate, changePassword);

export default router;