import rateLimit from "express-rate-limit";

/**
 * Rate limiter para rotas de autenticação
 * Previne ataques de força bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  message: {
    success: false,
    message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Identifica por IP
  keyGenerator: (req) => {
    return req.ip || "unknown";
  },
});

/**
 * Rate limiter para criação de contas
 */
export const signupLimiter = rateLimit({
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
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});