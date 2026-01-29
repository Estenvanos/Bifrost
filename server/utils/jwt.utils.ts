import jwt, { SignOptions } from "jsonwebtoken";

interface JWTPayload {
  userId: string;
  email: string;
  type: "customer" | "admin" | "owner";
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gera um par de tokens (access + refresh)
 */
export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables");
  }

  const accessTokenOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, accessTokenOptions);

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    JWT_REFRESH_SECRET,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

/**
 * Verifica e decodifica um access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in environment variables");
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
};

/**
 * Verifica e decodifica um refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET must be defined in environment variables");
  }

  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
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