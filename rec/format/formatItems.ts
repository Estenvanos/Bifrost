import type { ProductLean, RecItem } from "@/types/recs";

export function formatItems(items: ProductLean[], reason: string): RecItem[] {
  return items.map((p) => ({
    id: p._id.toString(),
    name: p.product_name,
    price: p.price,
    category: p.category,
    rating: p.rating ?? 0,
    review_count: p.review_count ?? 0,
    score: p.score !== undefined ? Number(p.score.toFixed(4)) : undefined,
    reason,
  }));
}
