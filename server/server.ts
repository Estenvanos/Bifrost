import dotenv from "dotenv";
// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { connectToDB } from "./db/mongoose";

const app = express();

// Get environment variables with defaults
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Configurações de segurança
app.use(helmet()); // Headers de segurança
app.use(cors({
  origin: CORS_ORIGIN,
}));
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded
app.use(apiLimiter); // Rate limiting global

// Rotas
app.use("/api/auth", authRoutes);

// Rota de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API está funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erro:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
  });
});

// Inicia o servidor
const startServer = async () => {
  try {
    // Conecta ao MongoDB primeiro
    await connectToDB();
    
    // Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${NODE_ENV}`);
      console.log(`🔐 Autenticação via Authorization header`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();

export default app;