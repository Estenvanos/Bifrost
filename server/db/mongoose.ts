import mongoose from "mongoose";
import { env } from "../config/env"
let isConnected = false; 

export const connectToDB = async () => {

  const uri = env.mongoUri;
  
  if (isConnected) {
    return;
  }

  if (!uri){
    throw new Error("Missing MONGODB_URI environment variable");
  }

  try {
    const db = await mongoose.connect(uri,{
    dbName: "ecommerce",
    });

    isConnected = db.connections[0].readyState === 1;

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
