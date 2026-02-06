import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import { connectToDB, disconnectFromDB } from "../db/mongoose";
import { Product } from "../models/Product";
import { Company } from "../models/Company";
import mongoose from "mongoose";

const seedProducts = async () => {
  try {
    console.log("🌱 Iniciando seed de produtos...");

    // Conecta ao banco
    await connectToDB();

    // Limpa a coleção de produtos (CUIDADO: isso apaga todos os produtos!)
    await Product.deleteMany({});
    console.log("🗑️  Produtos existentes removidos");

    // Busca ou cria uma empresa de teste
    let company = await Company.findOne({ name: "Tech Store" });

    if (!company) {
      company = await Company.create({
        name: "Tech Store",
        slug: "tech-store",
        ownerId: "507f1f77bcf86cd799439011", // Placeholder
        description: "Leading technology retailer",
        email: "contact@techstore.com",
        status: "active",
      });
      console.log("🏢 Empresa de teste criada");
    }

    const companyId = company._id.toString();

    // Cria produtos de teste
    const products = [
      // Electronics
      {
        name: "Smartphone Galaxy S24",
        slug: "smartphone-galaxy-s24",
        companyId: companyId,
        description: "Latest flagship smartphone with 5G, 200MP camera, and 6.8\" AMOLED display",
        images: [{ url: "https://example.com/images/galaxy-s24.jpg", isPrimary: true }],
        price: 999.99,
        category: "electronics",
        tags: ["smartphone", "android", "samsung", "5g"],
        status: "active",
      },
      {
        name: "MacBook Pro 16\"",
        slug: "macbook-pro-16",
        companyId: companyId,
        description: "Powerful laptop with M3 Pro chip, 16GB RAM, and stunning Retina display",
        images: [{ url: "https://example.com/images/macbook-pro.jpg", isPrimary: true }],
        price: 2499.99,
        category: "electronics",
        tags: ["laptop", "apple", "macbook", "m3"],
        status: "active",
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        slug: "sony-wh-1000xm5-headphones",
        companyId: companyId,
        description: "Industry-leading noise canceling wireless headphones with premium sound quality",
        images: [{ url: "https://example.com/images/sony-headphones.jpg", isPrimary: true }],
        price: 399.99,
        category: "electronics",
        tags: ["headphones", "wireless", "noise-canceling", "sony"],
        status: "active",
      },
      {
        name: "iPad Air 11\"",
        slug: "ipad-air-11",
        companyId: companyId,
        description: "Versatile tablet with M2 chip, perfect for work and creativity",
        images: [{ url: "https://example.com/images/ipad-air.jpg", isPrimary: true }],
        price: 599.99,
        category: "electronics",
        tags: ["tablet", "apple", "ipad", "m2"],
        status: "active",
      },
      // Fashion
      {
        name: "Nike Air Max 270",
        slug: "nike-air-max-270",
        companyId: companyId,
        description: "Comfortable running shoes with responsive cushioning and breathable mesh",
        images: [{ url: "https://example.com/images/nike-airmax.jpg", isPrimary: true }],
        price: 149.99,
        category: "fashion",
        tags: ["shoes", "sneakers", "nike", "sportswear"],
        status: "active",
      },
      {
        name: "Levi's 501 Original Jeans",
        slug: "levis-501-original-jeans",
        companyId: companyId,
        description: "Classic straight-fit jeans with original button fly",
        images: [{ url: "https://example.com/images/levis-501.jpg", isPrimary: true }],
        price: 89.99,
        category: "fashion",
        tags: ["jeans", "denim", "levis", "clothing"],
        status: "active",
      },
      {
        name: "Ray-Ban Aviator Sunglasses",
        slug: "ray-ban-aviator-sunglasses",
        companyId: companyId,
        description: "Iconic aviator sunglasses with UV protection",
        images: [{ url: "https://example.com/images/rayban-aviator.jpg", isPrimary: true }],
        price: 199.99,
        category: "fashion",
        tags: ["sunglasses", "rayban", "accessories", "eyewear"],
        status: "active",
      },
      // Home
      {
        name: "Dyson V15 Vacuum Cleaner",
        slug: "dyson-v15-vacuum-cleaner",
        companyId: companyId,
        description: "Powerful cordless vacuum with laser detection and advanced filtration",
        images: [{ url: "https://example.com/images/dyson-v15.jpg", isPrimary: true }],
        price: 649.99,
        category: "home",
        tags: ["vacuum", "cleaning", "dyson", "cordless"],
        status: "active",
      },
      {
        name: "Instant Pot Duo 7-in-1",
        slug: "instant-pot-duo-7-in-1",
        companyId: companyId,
        description: "Versatile pressure cooker that replaces 7 kitchen appliances",
        images: [{ url: "https://example.com/images/instant-pot.jpg", isPrimary: true }],
        price: 89.99,
        category: "home",
        tags: ["kitchen", "cooking", "pressure-cooker", "appliance"],
        status: "active",
      },
      {
        name: "Philips Hue Smart Bulbs (4-Pack)",
        slug: "philips-hue-smart-bulbs-4-pack",
        companyId: companyId,
        description: "Color-changing smart LED bulbs controlled via app",
        images: [{ url: "https://example.com/images/philips-hue.jpg", isPrimary: true }],
        price: 129.99,
        category: "home",
        tags: ["smart-home", "lighting", "led", "philips"],
        status: "active",
      },
      // Sports
      {
        name: "Yoga Mat Premium",
        slug: "yoga-mat-premium",
        companyId: companyId,
        description: "Extra-thick non-slip yoga mat for comfort and stability",
        images: [{ url: "https://example.com/images/yoga-mat.jpg", isPrimary: true }],
        price: 49.99,
        category: "sports",
        tags: ["yoga", "fitness", "exercise", "mat"],
        status: "active",
      },
      {
        name: "Adjustable Dumbbell Set",
        slug: "adjustable-dumbbell-set",
        companyId: companyId,
        description: "Space-saving adjustable dumbbells from 5 to 52.5 lbs",
        images: [{ url: "https://example.com/images/dumbbells.jpg", isPrimary: true }],
        price: 299.99,
        category: "sports",
        tags: ["fitness", "weights", "dumbbells", "home-gym"],
        status: "active",
      },
      // Books
      {
        name: "The Psychology of Money",
        slug: "the-psychology-of-money",
        companyId: companyId,
        description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel",
        images: [{ url: "https://example.com/images/psychology-money.jpg", isPrimary: true }],
        price: 16.99,
        category: "books",
        tags: ["book", "finance", "psychology", "bestseller"],
        status: "active",
      },
      {
        name: "Atomic Habits",
        slug: "atomic-habits",
        companyId: companyId,
        description: "An easy and proven way to build good habits by James Clear",
        images: [{ url: "https://example.com/images/atomic-habits.jpg", isPrimary: true }],
        price: 18.99,
        category: "books",
        tags: ["book", "self-help", "habits", "productivity"],
        status: "active",
      },
      {
        name: "Kindle Paperwhite",
        slug: "kindle-paperwhite",
        companyId: companyId,
        description: "Waterproof e-reader with 6.8\" display and adjustable warm light",
        images: [{ url: "https://example.com/images/kindle.jpg", isPrimary: true }],
        price: 139.99,
        category: "electronics",
        tags: ["e-reader", "kindle", "books", "amazon"],
        status: "active",
      },
    ];

    // Insere os produtos
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} produtos criados com sucesso!`);

    // Mostra os produtos criados
    console.log("\n📦 Produtos criados:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    createdProducts.forEach((product) => {
      console.log(`
📱 ${product.name}
   Company: ${product.companyId.toString().substring(0, 10)}...
   Price: $${product.price.toFixed(2)}
   Category: ${product.category}
   Tags: ${product.tags.join(", ")}
   ID: ${product._id}
      `);
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🎯 Use esses produtos para testar as rotas da API!");
    console.log("💡 Dica: Copie um ID de produto para testar GET, PUT, DELETE\n");

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
seedProducts();