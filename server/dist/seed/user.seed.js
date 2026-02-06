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
// Load environment variables first
dotenv_1.default.config();
const mongoose_1 = require("../db/mongoose");
const User_1 = require("../models/User");
const password_utils_1 = require("../utils/password.utils");
const seedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🌱 Iniciando seed do banco de dados...");
        // Conecta ao banco
        yield (0, mongoose_1.connectToDB)();
        // Limpa a coleção de usuários (CUIDADO: isso apaga todos os usuários!)
        yield User_1.User.deleteMany({});
        console.log("🗑️  Usuários existentes removidos");
        // Hash das senhas
        const customerPassword = yield (0, password_utils_1.hashPassword)("Customer@123");
        const adminPassword = yield (0, password_utils_1.hashPassword)("Admin@123");
        // Cria usuários de teste
        const users = [
            {
                username: "john_customer",
                email: "john@customer.com",
                password: customerPassword,
                type: "customer",
            },
            {
                username: "jane_customer",
                email: "jane@customer.com",
                password: customerPassword,
                type: "customer",
            },
            {
                username: "admin_user",
                email: "admin@admin.com",
                password: adminPassword,
                type: "owner",
            },
            {
                username: "super_admin",
                email: "super@admin.com",
                password: adminPassword,
                type: "owner",
            },
            {
                username: "test_user",
                email: "test@test.com",
                password: yield (0, password_utils_1.hashPassword)("Test@123"),
                type: "customer",
            },
        ];
        // Insere os usuários
        const createdUsers = yield User_1.User.insertMany(users);
        console.log(`✅ ${createdUsers.length} usuários criados com sucesso!`);
        // Mostra os usuários criados
        console.log("\n📋 Usuários criados:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        createdUsers.forEach((user) => {
            const passwordInfo = user.type === "customer" ? "Customer@123" :
                user.type === "admin" ? "Admin@123" : "Test@123";
            console.log(`
👤 ${user.username}
   Email: ${user.email}
   Senha: ${passwordInfo}
   Tipo: ${user.type}
   ID: ${user._id}
      `);
        });
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n🎯 Use essas credenciais para testar as rotas de autenticação!");
        console.log("💡 Dica: Copie o email e senha para usar no Insomnia\n");
        // Desconecta do banco
        yield (0, mongoose_1.disconnectFromDB)();
        console.log("✅ Seed concluído com sucesso!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Erro ao fazer seed:", error);
        process.exit(1);
    }
});
// Executa o seed
seedUsers();
