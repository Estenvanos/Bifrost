import { Product } from "@/lib/models/Product";
import type { RecItem } from "@/types/recs";

export async function getTrendingProducts(limit: number): Promise<RecItem[]> {
  const items = await Product.find({ "vector.0": { $exists: true } })
    .sort({ rating: -1, review_count: -1, updatedAt: -1 })
    .limit(limit)
    .select("_id product_name price category rating review_count")
    .lean();

  return items.map((p: any) => ({
    id: p._id.toString(),
    name: p.product_name,
    price: p.price,
    category: p.category,
    rating: p.rating ?? 0,
    review_count: p.review_count ?? 0,
    reason: "cold_start_trending",
  }));
}
