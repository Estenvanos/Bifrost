import { NextResponse } from "next/server";
import { Product } from "@/lib/models/Product";

const CATEGORIES = [
  "electronics",
  "fashion",
  "sports",
  "home",
  "books",
  "beauty",
  "toys",
  "gaming",
];

const TAGS = [
  "new",
  "popular",
  "sale",
  "premium",
  "budget",
  "eco",
  "wireless",
  "smart",
];

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min = 20, max = 1500) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function randomTags() {
  const count = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: count }, () => randomFrom(TAGS));
}

export async function POST() {
  // 🔒 optional safety: avoid reseeding
  const existing = await Product.countDocuments();
  if (existing > 0) {
    return NextResponse.json(
      { message: "Products already exist. Seed aborted." },
      { status: 400 }
    );
  }

  const products = Array.from({ length: 200 }).map((_, i) => {
    const category = randomFrom(CATEGORIES);

    return {
      product_name: `${category.toUpperCase()} Product ${i + 1}`,
      description: `High quality ${category} product number ${i + 1}.`,
      price: randomPrice(),
      category,
      tags: randomTags(),
      rating: 0,
      review_count: 0,
      vector: [],
      vector_version: 1,
    };
  });

  await Product.insertMany(products);

  return NextResponse.json({
    success: true,
    inserted: products.length,
  });
}
