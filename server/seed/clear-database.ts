import dotenv from "dotenv";
dotenv.config();

import { connectToDB, disconnectFromDB } from "../db/mongoose";
import { User } from "../models/User";
import { Company } from "../models/Company";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Review } from "../models/Review";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Wishlist } from "../models/Wishlist";
import { UserInteraction } from "../models/UserInteraction";
import mongoose from "mongoose";

/**
 * Clear all database collections and drop old indexes
 */
const clearDatabase = async () => {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("🗑️  CLEARING DATABASE");
        console.log("=".repeat(60) + "\n");

        await connectToDB();

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }

        // Step 1: Clear all collections
        console.log("📋 Clearing collections...\n");

        const collections = [
            { name: "Users", model: User },
            { name: "Companies", model: Company },
            { name: "Products", model: Product },
            { name: "Orders", model: Order },
            { name: "Reviews", model: Review },
            { name: "Carts", model: Cart },
            { name: "CartItems", model: CartItem },
            { name: "Wishlists", model: Wishlist },
            { name: "UserInteractions", model: UserInteraction },
        ];

        for (const { name, model } of collections) {
            try {
                const result = await model.deleteMany({});
                console.log(`  ✅ ${name}: ${result.deletedCount} documents deleted`);
            } catch (err: any) {
                console.log(`  ⚠️  ${name}: ${err.message}`);
            }
        }

        // Step 2: Drop old indexes
        console.log("\n📋 Dropping old indexes...\n");

        // Drop old Company indexes
        try {
            const companyCollection = db.collection("companies");
            const oldCompanyIndexes = ["contact_email_1", "company_name_1", "owner_user_id_1"];

            for (const indexName of oldCompanyIndexes) {
                try {
                    await companyCollection.dropIndex(indexName);
                    console.log(`  ✅ Dropped Company index: ${indexName}`);
                } catch (err: any) {
                    if (err.code === 27) {
                        console.log(`  ℹ️  Company index ${indexName} does not exist`);
                    } else {
                        console.log(`  ⚠️  Could not drop ${indexName}: ${err.message}`);
                    }
                }
            }
        } catch (err: any) {
            console.log(`  ⚠️  Error accessing companies collection: ${err.message}`);
        }

        // Drop old User indexes
        try {
            const userCollection = db.collection("users");
            const oldUserIndexes = ["username_1", "company_id_1"];

            for (const indexName of oldUserIndexes) {
                try {
                    await userCollection.dropIndex(indexName);
                    console.log(`  ✅ Dropped User index: ${indexName}`);
                } catch (err: any) {
                    if (err.code === 27) {
                        console.log(`  ℹ️  User index ${indexName} does not exist`);
                    } else {
                        console.log(`  ⚠️  Could not drop ${indexName}: ${err.message}`);
                    }
                }
            }
        } catch (err: any) {
            console.log(`  ⚠️  Error accessing users collection: ${err.message}`);
        }

        // Drop old Product indexes
        try {
            const productCollection = db.collection("products");
            const oldProductIndexes = ["product_name_1", "company_id_1"];

            for (const indexName of oldProductIndexes) {
                try {
                    await productCollection.dropIndex(indexName);
                    console.log(`  ✅ Dropped Product index: ${indexName}`);
                } catch (err: any) {
                    if (err.code === 27) {
                        console.log(`  ℹ️  Product index ${indexName} does not exist`);
                    } else {
                        console.log(`  ⚠️  Could not drop ${indexName}: ${err.message}`);
                    }
                }
            }
        } catch (err: any) {
            console.log(`  ⚠️  Error accessing products collection: ${err.message}`);
        }

        console.log("\n" + "=".repeat(60));
        console.log("✅ DATABASE CLEARED SUCCESSFULLY!");
        console.log("=".repeat(60) + "\n");
        console.log("💡 Now you can run seed scripts:");
        console.log("   - npm run seed:users");
        console.log("   - npm run seed:companies");
        console.log("   - npm run seed:products");
        console.log("   - npm run seed:integrated\n");

        await disconnectFromDB();
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error clearing database:", error);
        process.exit(1);
    }
};

clearDatabase();
