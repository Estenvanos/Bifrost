import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyAccessToken } from "../utils/jwt.utils" ;

// Extende o tipo Request do Express para incluir dados do usuário
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    type: "customer" | "admin";
  };
}

/**
 * Middleware que verifica se o usuário está autenticado
 * First checks cookies, then falls back to Authorization header
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookies first
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header if no cookie
    if (!token) {
      token = extractTokenFromHeader(req.headers.authorization);
    }

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
      type: decoded.type,
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
 * Middleware que verifica se o usuário é admin
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

  if (req.user.type !== "admin") {
    res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas administradores podem acessar este recurso",
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
    // Try cookies first
    let token = req.cookies?.accessToken;

    // Fallback to header
    if (!token) {
      token = extractTokenFromHeader(req.headers.authorization);
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type,
      };
    }
  } catch (error) {
    // Ignora erros de token em autenticação opcional
  }

  next();
};