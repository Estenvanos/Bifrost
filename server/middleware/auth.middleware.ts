import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyAccessToken } from "../utils/jwt.utils";

// Extende o tipo Request do Express para incluir dados do usuário
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: "customer" | "vendor" | "admin";
  };
}

/**
 * Middleware que verifica se o usuário está autenticado
 * Checks Authorization header only
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token de autenticação não fornecido",
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    // Adiciona os dados do usuário à requisição
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido ou expirado",
    });
  }
};

/**
 * Middleware que verifica se o usuário é admin ou owner
 * Admin e owner agora são equivalentes - ambos podem gerenciar empresas
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
};

/**
 * Middleware opcional - não retorna erro se não houver tokens
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch (error) {
    // Ignora erros de token em autenticação opcional
  }

  next();
};