import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import { connectToDB, disconnectFromDB } from "../db/mongoose";
import { User } from "../models/User";
import { hashPassword } from "../utils/password.utils";

const seedUsers = async () => {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Conecta ao banco
    await connectToDB();

    // Limpa a coleção de usuários (CUIDADO: isso apaga todos os usuários!)
    await User.deleteMany({});
    console.log("🗑️  Usuários existentes removidos");

    // Hash das senhas
    const customerPassword = await hashPassword("Customer@123");
    const adminPassword = await hashPassword("Admin@123");

    // Cria usuários de teste
    const users = [
      {
        email: "john@customer.com",
        password: customerPassword,
        role: "customer",
        firstName: "John",
        lastName: "Customer",
      },
      {
        email: "jane@customer.com",
        password: customerPassword,
        role: "customer",
        firstName: "Jane",
        lastName: "Customer",
      },
      {
        email: "admin@admin.com",
        password: adminPassword,
        role: "admin",
        firstName: "Admin",
        lastName: "User",
      },
      {
        email: "super@admin.com",
        password: adminPassword,
        role: "admin",
        firstName: "Super",
        lastName: "Admin",
      },
      {
        email: "test@test.com",
        password: await hashPassword("Test@123"),
        role: "customer",
        firstName: "Test",
        lastName: "User",
      },
    ];

    // Insere os usuários
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} usuários criados com sucesso!`);

    // Mostra os usuários criados
    console.log("\n📋 Usuários criados:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    createdUsers.forEach((user) => {
      const passwordInfo =
        user.role === "customer" ? "Customer@123" :
          user.role === "admin" ? "Admin@123" : "Test@123";

      console.log(`
👤 ${user.firstName} ${user.lastName}
   Email: ${user.email}
   Senha: ${passwordInfo}
   Role: ${user.role}
   ID: ${user._id}
      `);
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🎯 Use essas credenciais para testar as rotas de autenticação!");
    console.log("💡 Dica: Copie o email e senha para usar no Insomnia\n");

    // Desconecta do banco
    await disconnectFromDB();
    console.log("✅ Seed concluído com sucesso!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
};

// Executa o seed
seedUsers();