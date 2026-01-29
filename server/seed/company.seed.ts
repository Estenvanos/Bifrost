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
        company_name: "Tech Innovations Inc",
        description: "Leading provider of innovative technology solutions for businesses worldwide",
        contact_email: "contact@techinnovations.com",
        website_url: "https://techinnovations.com",
        phone_number: "+1-555-0100",
        address: "123 Tech Boulevard, Silicon Valley, CA 94025",
        is_active: true,
      },
      {
        company_name: "Global Electronics",
        description: "Premier supplier of consumer electronics and smart home devices",
        contact_email: "info@globalelectronics.com",
        website_url: "https://globalelectronics.com",
        phone_number: "+1-555-0200",
        address: "456 Electronics Ave, San Jose, CA 95134",
        is_active: true,
      },
      {
        company_name: "Fashion Forward LLC",
        description: "Trendsetting fashion brand delivering style and quality since 2010",
        contact_email: "hello@fashionforward.com",
        website_url: "https://fashionforward.com",
        phone_number: "+1-555-0300",
        address: "789 Fashion Street, New York, NY 10001",
        is_active: true,
      },
      {
        company_name: "Home Essentials Co",
        description: "Your one-stop shop for quality home goods and appliances",
        contact_email: "support@homeessentials.com",
        website_url: "https://homeessentials.com",
        phone_number: "+1-555-0400",
        address: "321 Home Lane, Chicago, IL 60601",
        is_active: true,
      },
      {
        company_name: "Sports Performance Pro",
        description: "Professional sports equipment and athletic wear for champions",
        contact_email: "team@sportsperformance.com",
        website_url: "https://sportsperformance.com",
        phone_number: "+1-555-0500",
        address: "654 Athletic Way, Portland, OR 97204",
        is_active: true,
      },
      {
        company_name: "Book Haven Publishers",
        description: "Publishing house dedicated to bringing great stories to life",
        contact_email: "editors@bookhaven.com",
        website_url: "https://bookhaven.com",
        phone_number: "+1-555-0600",
        address: "987 Literary Road, Boston, MA 02108",
        is_active: true,
      },
      {
        company_name: "Green Living Supplies",
        description: "Eco-friendly products for sustainable living",
        contact_email: "green@greenlivingsupplies.com",
        website_url: "https://greenlivingsupplies.com",
        phone_number: "+1-555-0700",
        address: "135 Eco Street, Seattle, WA 98101",
        is_active: true,
      },
      {
        company_name: "Digital Solutions Labs",
        description: "Custom software development and IT consulting services",
        contact_email: "solutions@digitallabs.com",
        website_url: "https://digitallabs.com",
        phone_number: "+1-555-0800",
        address: "246 Innovation Drive, Austin, TX 78701",
        is_active: true,
      },
      {
        company_name: "Startup Ventures (Inactive)",
        description: "Test company for inactive status",
        contact_email: "old@startupventures.com",
        website_url: "https://startupventures.com",
        phone_number: "+1-555-0900",
        address: "999 Legacy Lane, Miami, FL 33101",
        is_active: false,
      },
    ];

    // Insere as empresas
    const createdCompanies = await Company.insertMany(companies);
    console.log(`✅ ${createdCompanies.length} empresas criadas com sucesso!`);

    // Mostra as empresas criadas
    console.log("\n🏢 Empresas criadas:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    createdCompanies.forEach((company) => {
      const statusIcon = company.is_active ? "✅" : "❌";
      console.log(`
${statusIcon} ${company.company_name}
   Email: ${company.contact_email}
   Website: ${company.website_url || "N/A"}
   Phone: ${company.phone_number || "N/A"}
   Status: ${company.is_active ? "Active" : "Inactive"}
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