import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI!,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),

  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};