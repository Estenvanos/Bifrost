import mongoose from "mongoose";
import { env } from "../config/env";

let isConnected = false;

export const connectToDB = async () => {
  const uri = env.mongoUri;

  // Se já está conectado, retorna
  if (isConnected) {
    console.log("✅ Usando conexão existente do MongoDB");
    return;
  }

  // Valida se a URI existe
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  } 

  try {
    // Configurações recomendadas para conexão
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000, // Timeout de socket de 45 segundos
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected) {
      console.log("✅ MongoDB conectado com sucesso");
    }

    // Event listeners para monitorar conexão
    mongoose.connection.on("connected", () => {
      console.log("📡 MongoDB: Conexão estabelecida");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB: Erro na conexão:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB: Conexão perdida");
      isConnected = false;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB: Conexão fechada (app encerrado)");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    console.error("\n💡 Dicas:");
    console.error("1. Verifique se MONGODB_URI está correta no arquivo .env");
    console.error("2. Certifique-se de que não há espaços na string de conexão");
    console.error("3. Formato esperado: mongodb+srv://usuario:senha@cluster.mongodb.net/database");
    console.error("4. Verifique se seu IP está autorizado no MongoDB Atlas");
    throw error; // Re-lança o erro para o startServer tratar
  }
};

// Função para desconectar do MongoDB
export const disconnectFromDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("🔌 MongoDB: Conexão fechada");
  } catch (error) {
    console.error("❌ Erro ao fechar conexão do MongoDB:", error);
    throw error;
  }
};