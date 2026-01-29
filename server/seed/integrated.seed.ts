import dotenv from "dotenv";
dotenv.config();

import { connectToDB, disconnectFromDB } from "../db/mongoose";
import { User } from "../models/User";
import { Company } from "../models/Company";
import { Product } from "../models/Product";
import { hashPassword } from "../utils/password.utils";

/**
 * Integrated seed that creates:
 * 1. Users
 * 2. Companies (linked to users)
 * 3. Products (linked to companies)
 */
const seedAll = async () => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🌱 INTEGRATED DATABASE SEED");
    console.log("=".repeat(60));

    await connectToDB();

    // Clear all collections
    console.log("\n🗑️  Limpando coleções existentes...");
    await User.deleteMany({});
    await Company.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Coleções limpas\n");

    // === STEP 1: Create Users ===
    console.log("👤 Criando usuários...");
    
    const customerPassword = await hashPassword("Customer@123");
    const adminPassword = await hashPassword("Admin@123");

    const users = await User.insertMany([
      {
        username: "tech_owner",
        email: "owner@techcorp.com",
        password: adminPassword,
        type: "admin",
      },
      {
        username: "fashion_owner",
        email: "owner@fashion.com",
        password: adminPassword,
        type: "admin",
      },
      {
        username: "electronics_owner",
        email: "owner@electronics.com",
        password: adminPassword,
        type: "admin",
      },
      {
        username: "regular_customer",
        email: "customer@test.com",
        password: customerPassword,
        type: "customer",
      },
    ]);

    console.log(`✅ ${users.length} usuários criados\n`);

    // === STEP 2: Create Companies ===
    console.log("🏢 Criando empresas...");

    const companies = await Company.insertMany([
      {
        company_name: "Tech Innovations Inc",
        owner_user_id: users[0]._id,
        description: "Leading technology solutions provider",
        contact_email: "contact@techcorp.com",
        website_url: "https://techcorp.com",
        phone_number: "+1-555-0100",
        is_active: true,
      },
      {
        company_name: "Fashion Forward LLC",
        owner_user_id: users[1]._id,
        description: "Trendsetting fashion brand",
        contact_email: "contact@fashion.com",
        website_url: "https://fashion.com",
        phone_number: "+1-555-0200",
        is_active: true,
      },
      {
        company_name: "Global Electronics",
        owner_user_id: users[2]._id,
        description: "Premier electronics supplier",
        contact_email: "contact@electronics.com",
        website_url: "https://electronics.com",
        phone_number: "+1-555-0300",
        is_active: true,
      },
    ]);

    console.log(`✅ ${companies.length} empresas criadas\n`);

    // === STEP 3: Link Users to Companies ===
    console.log("🔗 Vinculando usuários às empresas...");

    await User.findByIdAndUpdate(users[0]._id, { company_id: companies[0]._id });
    await User.findByIdAndUpdate(users[1]._id, { company_id: companies[1]._id });
    await User.findByIdAndUpdate(users[2]._id, { company_id: companies[2]._id });

    console.log("✅ Vínculos criados\n");

    // === STEP 4: Create Products ===
    console.log("📦 Criando produtos...");

    const products = await Product.insertMany([
      // Tech Corp Products
      {
        product_name: "MacBook Pro 16\"",
        company_id: companies[0]._id.toString(),
        description: "Powerful laptop with M3 Pro chip",
        price: 2499.99,
        category: "electronics",
        tags: ["laptop", "apple"],
      },
      {
        product_name: "iPad Air",
        company_id: companies[0]._id.toString(),
        description: "Versatile tablet with M2 chip",
        price: 599.99,
        category: "electronics",
        tags: ["tablet", "apple"],
      },
      // Fashion Products
      {
        product_name: "Nike Air Max 270",
        company_id: companies[1]._id.toString(),
        description: "Comfortable running shoes",
        price: 149.99,
        category: "fashion",
        tags: ["shoes", "nike"],
      },
      {
        product_name: "Levi's 501 Jeans",
        company_id: companies[1]._id.toString(),
        description: "Classic straight-fit jeans",
        price: 89.99,
        category: "fashion",
        tags: ["jeans", "levis"],
      },
      // Electronics Products
      {
        product_name: "Samsung Galaxy S24",
        company_id: companies[2]._id.toString(),
        description: "Latest flagship smartphone",
        price: 999.99,
        category: "electronics",
        tags: ["smartphone", "samsung"],
      },
      {
        product_name: "Sony WH-1000XM5",
        company_id: companies[2]._id.toString(),
        description: "Premium noise-canceling headphones",
        price: 399.99,
        category: "electronics",
        tags: ["headphones", "sony"],
      },
    ]);

    console.log(`✅ ${products.length} produtos criados\n`);

    // === Display Summary ===
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMO DO SEED");
    console.log("=".repeat(60));

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const owner = users[i];
      const companyProducts = products.filter(
        p => p.company_id === company._id.toString()
      );

      console.log(`\n🏢 ${company.company_name}`);
      console.log(`   Owner: ${owner.email} (${owner.username})`);
      console.log(`   Password: Admin@123`);
      console.log(`   Company ID: ${company._id}`);
      console.log(`   User ID: ${owner._id}`);
      console.log(`   Produtos: ${companyProducts.length}`);
      companyProducts.forEach(p => {
        console.log(`     - ${p.product_name} ($${p.price})`);
      });
    }

    console.log(`\n👤 Cliente sem empresa:`);
    console.log(`   Email: ${users[3].email}`);
    console.log(`   Password: Customer@123`);
    console.log(`   Pode visualizar mas não criar produtos\n`);

    console.log("=".repeat(60));
    console.log("✅ SEED COMPLETO!");
    console.log("=".repeat(60) + "\n");

    await disconnectFromDB();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erro no seed:", error);
    process.exit(1);
  }
};

seedAll();