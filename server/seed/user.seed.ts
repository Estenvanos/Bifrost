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
        password: await hashPassword("Test@123"),
        type: "customer",
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
        user.type === "customer" ? "Customer@123" :
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