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
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const mongoose_1 = require("./db/mongoose");
const app = (0, express_1.default)();
// Get environment variables with defaults
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
// Configurações de segurança
app.use((0, helmet_1.default)()); // Headers de segurança
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    credentials: true, // Allow cookies
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json()); // Parse JSON
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded
app.use(rateLimit_middleware_1.apiLimiter); // Rate limiting global
// Rotas
app.use("/api/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/companies", company_routes_1.default);
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
app.use((err, req, res, next) => {
    console.error("Erro:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Erro interno do servidor",
    });
});
// Inicia o servidor
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Conecta ao MongoDB primeiro
        yield (0, mongoose_1.connectToDB)();
        // Inicia o servidor Express
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`🌍 Ambiente: ${NODE_ENV}`);
        });
    }
    catch (error) {
        console.error("❌ Falha ao iniciar servidor:", error);
        process.exit(1);
    }
});
startServer();
exports.default = app;
