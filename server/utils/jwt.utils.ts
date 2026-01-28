import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

interface JWTPayload {
  userId: string;
  email: string;
  type: "customer" | "admin";
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gera um par de tokens (access + refresh)
 */
export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  const accessTokenOptions: SignOptions = {
    expiresIn: parseInt(env.jwtExpiresIn),
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: parseInt(env.jwtRefreshExpiresIn, 10),
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, accessTokenOptions);

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    env.jwtRefreshSecret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

/**
 * Verifica e decodifica um access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
};

/**
 * Verifica e decodifica um refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as { userId: string };
  } catch (error) {
    throw new Error("Refresh token inválido ou expirado");
  }
};

/**
 * Extrai o token do header Authorization
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};