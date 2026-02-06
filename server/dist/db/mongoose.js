"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromDB = exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
const connectToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const uri = process.env.MONGODB_URI;
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
        const db = yield mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
            socketTimeoutMS: 45000, // Timeout de socket de 45 segundos
        });
        isConnected = db.connections[0].readyState === 1;
        if (isConnected) {
            console.log("✅ MongoDB conectado com sucesso");
        }
        // Event listeners para monitorar conexão
        mongoose_1.default.connection.on("connected", () => {
            console.log("📡 MongoDB: Conexão estabelecida");
        });
        mongoose_1.default.connection.on("error", (err) => {
            console.error("❌ MongoDB: Erro na conexão:", err);
            isConnected = false;
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB: Conexão perdida");
            isConnected = false;
        });
        // Graceful shutdown
        process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.connection.close();
            console.log("🔌 MongoDB: Conexão fechada (app encerrado)");
            process.exit(0);
        }));
    }
    catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB:", error);
        console.error("\n💡 Dicas:");
        console.error("1. Verifique se MONGODB_URI está correta no arquivo .env");
        console.error("2. Certifique-se de que não há espaços na string de conexão");
        console.error("3. Formato esperado: mongodb+srv://usuario:senha@cluster.mongodb.net/database");
        console.error("4. Verifique se seu IP está autorizado no MongoDB Atlas");
        throw error; // Re-lança o erro para o startServer tratar
    }
});
exports.connectToDB = connectToDB;
// Função para desconectar do MongoDB
const disconnectFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!isConnected) {
        return;
    }
    try {
        yield mongoose_1.default.connection.close();
        isConnected = false;
        console.log("🔌 MongoDB: Conexão fechada");
    }
    catch (error) {
        console.error("❌ Erro ao fechar conexão do MongoDB:", error);
        throw error;
    }
});
exports.disconnectFromDB = disconnectFromDB;
