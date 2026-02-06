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
        email: "owner@techcorp.com",
        password: adminPassword,
        role: "vendor",
        firstName: "Tech",
        lastName: "Owner",
      },
      {
        email: "owner@fashion.com",
        password: adminPassword,
        role: "vendor",
        firstName: "Fashion",
        lastName: "Owner",
      },
      {
        email: "owner@electronics.com",
        password: adminPassword,
        role: "vendor",
        firstName: "Electronics",
        lastName: "Owner",
      },
      {
        email: "customer@test.com",
        password: customerPassword,
        role: "customer",
        firstName: "Regular",
        lastName: "Customer",
      },
      // Test users for integration tests
      {
        email: "john@customer.com",
        password: customerPassword,
        role: "customer",
        firstName: "John",
        lastName: "Customer",
      },
      {
        email: "admin@admin.com",
        password: adminPassword,
        role: "admin",
        firstName: "Admin",
        lastName: "User",
      },
    ]);

    console.log(`✅ ${users.length} usuários criados\n`);

    // === STEP 2: Create Companies ===
    console.log("🏢 Criando empresas...");

    const companies = await Company.insertMany([
      {
        name: "Tech Innovations Inc",
        slug: "tech-innovations-inc",
        ownerId: users[0]._id,
        description: "Leading technology solutions provider",
        email: "contact@techcorp.com",
        phone: "+1-555-0100",
        status: "active",
      },
      {
        name: "Fashion Forward LLC",
        slug: "fashion-forward-llc",
        ownerId: users[1]._id,
        description: "Trendsetting fashion brand",
        email: "contact@fashion.com",
        phone: "+1-555-0200",
        status: "active",
      },
      {
        name: "Global Electronics",
        slug: "global-electronics",
        ownerId: users[2]._id,
        description: "Premier electronics supplier",
        email: "contact@electronics.com",
        phone: "+1-555-0300",
        status: "active",
      },
    ]);

    console.log(`✅ ${companies.length} empresas criadas\n`);

    // === STEP 3: Link Users to Companies ===
    console.log("🔗 Vinculando usuários às empresas...");

    await User.findByIdAndUpdate(users[0]._id, { companyId: companies[0]._id });
    await User.findByIdAndUpdate(users[1]._id, { companyId: companies[1]._id });
    await User.findByIdAndUpdate(users[2]._id, { companyId: companies[2]._id });

    console.log("✅ Vínculos criados\n");

    // === STEP 4: Create Products ===
    console.log("📦 Criando produtos...");

    const products = await Product.insertMany([
      // Tech Corp Products
      {
        name: "MacBook Pro 16\"",
        slug: "macbook-pro-16",
        companyId: companies[0]._id.toString(),
        description: "Powerful laptop with M3 Pro chip",
        price: 2499.99,
        category: "electronics",
        tags: ["laptop", "apple"],
        status: "active",
      },
      {
        name: "iPad Air",
        slug: "ipad-air",
        companyId: companies[0]._id.toString(),
        description: "Versatile tablet with M2 chip",
        price: 599.99,
        category: "electronics",
        tags: ["tablet", "apple"],
        status: "active",
      },
      // Fashion Products
      {
        name: "Nike Air Max 270",
        slug: "nike-air-max-270",
        companyId: companies[1]._id.toString(),
        description: "Comfortable running shoes",
        price: 149.99,
        category: "fashion",
        tags: ["shoes", "nike"],
        status: "active",
      },
      {
        name: "Levi's 501 Jeans",
        slug: "levis-501-jeans",
        companyId: companies[1]._id.toString(),
        description: "Classic straight-fit jeans",
        price: 89.99,
        category: "fashion",
        tags: ["jeans", "levis"],
        status: "active",
      },
      // Electronics Products
      {
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        companyId: companies[2]._id.toString(),
        description: "Latest flagship smartphone",
        price: 999.99,
        category: "electronics",
        tags: ["smartphone", "samsung"],
        status: "active",
      },
      {
        name: "Sony WH-1000XM5",
        slug: "sony-wh-1000xm5",
        companyId: companies[2]._id.toString(),
        description: "Premium noise-canceling headphones",
        price: 399.99,
        category: "electronics",
        tags: ["headphones", "sony"],
        status: "active",
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
        p => p.companyId === company._id.toString()
      );

      console.log(`\n🏢 ${company.name}`);
      console.log(`   Owner: ${owner.email} (${owner.firstName} ${owner.lastName})`);
      console.log(`   Password: Admin@123`);
      console.log(`   Company ID: ${company._id}`);
      console.log(`   User ID: ${owner._id}`);
      console.log(`   Produtos: ${companyProducts.length}`);
      companyProducts.forEach(p => {
        console.log(`     - ${p.name} ($${p.price})`);
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