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
const Product_1 = require("../models/Product");
const Company_1 = require("../models/Company");
const seedProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🌱 Iniciando seed de produtos...");
        // Conecta ao banco
        yield (0, mongoose_1.connectToDB)();
        // Limpa a coleção de produtos (CUIDADO: isso apaga todos os produtos!)
        yield Product_1.Product.deleteMany({});
        console.log("🗑️  Produtos existentes removidos");
        // Busca ou cria uma empresa de teste
        let company = yield Company_1.Company.findOne({ company_name: "Tech Store" });
        if (!company) {
            company = yield Company_1.Company.create({
                company_name: "Tech Store",
                description: "Leading technology retailer",
                contact_email: "contact@techstore.com",
                website_url: "https://techstore.com",
                is_active: true,
            });
            console.log("🏢 Empresa de teste criada");
        }
        const companyId = company._id.toString();
        // Cria produtos de teste
        const products = [
            // Electronics
            {
                product_name: "Smartphone Galaxy S24",
                company_id: companyId,
                description: "Latest flagship smartphone with 5G, 200MP camera, and 6.8\" AMOLED display",
                image_url: "https://example.com/images/galaxy-s24.jpg",
                price: 999.99,
                category: "electronics",
                tags: ["smartphone", "android", "samsung", "5g"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "MacBook Pro 16\"",
                company_id: companyId,
                description: "Powerful laptop with M3 Pro chip, 16GB RAM, and stunning Retina display",
                image_url: "https://example.com/images/macbook-pro.jpg",
                price: 2499.99,
                category: "electronics",
                tags: ["laptop", "apple", "macbook", "m3"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Sony WH-1000XM5 Headphones",
                company_id: companyId,
                description: "Industry-leading noise canceling wireless headphones with premium sound quality",
                image_url: "https://example.com/images/sony-headphones.jpg",
                price: 399.99,
                category: "electronics",
                tags: ["headphones", "wireless", "noise-canceling", "sony"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "iPad Air 11\"",
                company_id: companyId,
                description: "Versatile tablet with M2 chip, perfect for work and creativity",
                image_url: "https://example.com/images/ipad-air.jpg",
                price: 599.99,
                category: "electronics",
                tags: ["tablet", "apple", "ipad", "m2"],
                rating: 0,
                review_count: 0,
            },
            // Fashion
            {
                product_name: "Nike Air Max 270",
                company_id: companyId,
                description: "Comfortable running shoes with responsive cushioning and breathable mesh",
                image_url: "https://example.com/images/nike-airmax.jpg",
                price: 149.99,
                category: "fashion",
                tags: ["shoes", "sneakers", "nike", "sportswear"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Levi's 501 Original Jeans",
                company_id: companyId,
                description: "Classic straight-fit jeans with original button fly",
                image_url: "https://example.com/images/levis-501.jpg",
                price: 89.99,
                category: "fashion",
                tags: ["jeans", "denim", "levis", "clothing"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Ray-Ban Aviator Sunglasses",
                company_id: companyId,
                description: "Iconic aviator sunglasses with UV protection",
                image_url: "https://example.com/images/rayban-aviator.jpg",
                price: 199.99,
                category: "fashion",
                tags: ["sunglasses", "rayban", "accessories", "eyewear"],
                rating: 0,
                review_count: 0,
            },
            // Home
            {
                product_name: "Dyson V15 Vacuum Cleaner",
                company_id: companyId,
                description: "Powerful cordless vacuum with laser detection and advanced filtration",
                image_url: "https://example.com/images/dyson-v15.jpg",
                price: 649.99,
                category: "home",
                tags: ["vacuum", "cleaning", "dyson", "cordless"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Instant Pot Duo 7-in-1",
                company_id: companyId,
                description: "Versatile pressure cooker that replaces 7 kitchen appliances",
                image_url: "https://example.com/images/instant-pot.jpg",
                price: 89.99,
                category: "home",
                tags: ["kitchen", "cooking", "pressure-cooker", "appliance"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Philips Hue Smart Bulbs (4-Pack)",
                company_id: companyId,
                description: "Color-changing smart LED bulbs controlled via app",
                image_url: "https://example.com/images/philips-hue.jpg",
                price: 129.99,
                category: "home",
                tags: ["smart-home", "lighting", "led", "philips"],
                rating: 0,
                review_count: 0,
            },
            // Sports
            {
                product_name: "Yoga Mat Premium",
                company_id: companyId,
                description: "Extra-thick non-slip yoga mat for comfort and stability",
                image_url: "https://example.com/images/yoga-mat.jpg",
                price: 49.99,
                category: "sports",
                tags: ["yoga", "fitness", "exercise", "mat"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Adjustable Dumbbell Set",
                company_id: companyId,
                description: "Space-saving adjustable dumbbells from 5 to 52.5 lbs",
                image_url: "https://example.com/images/dumbbells.jpg",
                price: 299.99,
                category: "sports",
                tags: ["fitness", "weights", "dumbbells", "home-gym"],
                rating: 0,
                review_count: 0,
            },
            // Books
            {
                product_name: "The Psychology of Money",
                company_id: companyId,
                description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel",
                image_url: "https://example.com/images/psychology-money.jpg",
                price: 16.99,
                category: "books",
                tags: ["book", "finance", "psychology", "bestseller"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Atomic Habits",
                company_id: companyId,
                description: "An easy and proven way to build good habits by James Clear",
                image_url: "https://example.com/images/atomic-habits.jpg",
                price: 18.99,
                category: "books",
                tags: ["book", "self-help", "habits", "productivity"],
                rating: 0,
                review_count: 0,
            },
            {
                product_name: "Kindle Paperwhite",
                company_id: companyId,
                description: "Waterproof e-reader with 6.8\" display and adjustable warm light",
                image_url: "https://example.com/images/kindle.jpg",
                price: 139.99,
                category: "electronics",
                tags: ["e-reader", "kindle", "books", "amazon"],
                rating: 0,
                review_count: 0,
            },
        ];
        // Insere os produtos
        const createdProducts = yield Product_1.Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} produtos criados com sucesso!`);
        // Mostra os produtos criados
        console.log("\n📦 Produtos criados:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        createdProducts.forEach((product) => {
            console.log(`
📱 ${product.product_name}
   Company: ${product.company_id.toString().substring(0, 10)}...
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
seedProducts();
