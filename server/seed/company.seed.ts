import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import { connectToDB, disconnectFromDB } from "../db/mongoose";
import { Company } from "../models/Company";

const seedCompanies = async () => {
  try {
    console.log("🌱 Iniciando seed de empresas...");

    // Conecta ao banco
    await connectToDB();

    // Limpa a coleção de empresas (CUIDADO: isso apaga todas as empresas!)
    await Company.deleteMany({});
    console.log("🗑️  Empresas existentes removidas");

    // Cria empresas de teste
    const companies = [
      {
        name: "Tech Innovations Inc",
        slug: "tech-innovations-inc",
        ownerId: "507f1f77bcf86cd799439011", // Placeholder - will need real user ID
        description: "Leading provider of innovative technology solutions for businesses worldwide",
        email: "contact@techinnovations.com",
        phone: "+1-555-0100",
        address: {
          street: "123 Tech Boulevard",
          city: "Silicon Valley",
          state: "CA",
          zipCode: "94025",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Global Electronics",
        slug: "global-electronics",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Premier supplier of consumer electronics and smart home devices",
        email: "info@globalelectronics.com",
        phone: "+1-555-0200",
        address: {
          street: "456 Electronics Ave",
          city: "San Jose",
          state: "CA",
          zipCode: "95134",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Fashion Forward LLC",
        slug: "fashion-forward-llc",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Trendsetting fashion brand delivering style and quality since 2010",
        email: "hello@fashionforward.com",
        phone: "+1-555-0300",
        address: {
          street: "789 Fashion Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Home Essentials Co",
        slug: "home-essentials-co",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Your one-stop shop for quality home goods and appliances",
        email: "support@homeessentials.com",
        phone: "+1-555-0400",
        address: {
          street: "321 Home Lane",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Sports Performance Pro",
        slug: "sports-performance-pro",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Professional sports equipment and athletic wear for champions",
        email: "team@sportsperformance.com",
        phone: "+1-555-0500",
        address: {
          street: "654 Athletic Way",
          city: "Portland",
          state: "OR",
          zipCode: "97204",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Book Haven Publishers",
        slug: "book-haven-publishers",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Publishing house dedicated to bringing great stories to life",
        email: "editors@bookhaven.com",
        phone: "+1-555-0600",
        address: {
          street: "987 Literary Road",
          city: "Boston",
          state: "MA",
          zipCode: "02108",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Green Living Supplies",
        slug: "green-living-supplies",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Eco-friendly products for sustainable living",
        email: "green@greenlivingsupplies.com",
        phone: "+1-555-0700",
        address: {
          street: "135 Eco Street",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Digital Solutions Labs",
        slug: "digital-solutions-labs",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Custom software development and IT consulting services",
        email: "solutions@digitallabs.com",
        phone: "+1-555-0800",
        address: {
          street: "246 Innovation Drive",
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          country: "USA"
        },
        status: "active",
      },
      {
        name: "Startup Ventures (Inactive)",
        slug: "startup-ventures-inactive",
        ownerId: "507f1f77bcf86cd799439011",
        description: "Test company for inactive status",
        email: "old@startupventures.com",
        phone: "+1-555-0900",
        address: {
          street: "999 Legacy Lane",
          city: "Miami",
          state: "FL",
          zipCode: "33101",
          country: "USA"
        },
        status: "suspended",
      },
    ];

    // Insere as empresas
    const createdCompanies = await Company.insertMany(companies);
    console.log(`✅ ${createdCompanies.length} empresas criadas com sucesso!`);

    // Mostra as empresas criadas
    console.log("\n🏢 Empresas criadas:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    createdCompanies.forEach((company) => {
      const statusIcon = company.status === "active" ? "✅" : "❌";
      console.log(`
${statusIcon} ${company.name}
   Email: ${company.email}
   Phone: ${company.phone || "N/A"}
   Status: ${company.status}
   ID: ${company._id}
      `);
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🎯 Use essas empresas para testar as rotas da API!");
    console.log("💡 Dica: Copie um ID de empresa para testar GET, PUT, DELETE\n");

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
seedCompanies();