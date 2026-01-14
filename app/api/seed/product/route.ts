// app/api/seed/products/route.ts
import { Product } from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoose";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { NextResponse } from "next/server";


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
  const picked = new Set<string>();
  while (picked.size < count) picked.add(randomFrom(TAGS));
  return Array.from(picked);
}

function buildProducts(amount: number) {
  return Array.from({ length: amount }).map((_, i) => {
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
}

export async function POST(request: Request) {
  try {
    const isAdmin = verifyAdminToken(request);
    if (!isAdmin) return new Response("Forbidden", { status: 403 });

    await connectToDB();

    const body = await request.json().catch(() => ({}));
    const amount = Number(body?.amount ?? 200);

    if (!Number.isFinite(amount) || amount <= 0 || amount > 2000) {
      return NextResponse.json(
        { error: "amount must be a number between 1 and 2000" },
        { status: 400 }
      );
    }

    // Optional: prevent accidental reseed
    const existing = await Product.countDocuments();
    if (existing > 0) {
      return NextResponse.json(
        {
          error: "Products already exist. Seed aborted.",
          existing,
        },
        { status: 400 }
      );
    }

    const products = buildProducts(amount);
    const inserted = await Product.insertMany(products, { ordered: true });

    return NextResponse.json(
      {
        success: true,
        inserted: inserted.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /seed/products ERROR:", error);
    return NextResponse.json(
      { error: "Failed to seed products" },
      { status: 500 }
    );
  }
}
