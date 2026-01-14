import { Product } from "@/lib/models/Product";

export async function fetchVectorCandidates(query: any, limit: number) {
  return Product.find({ ...query, "vector.0": { $exists: true } })
    .limit(limit)
    .select("_id product_name price category rating review_count vector")
    .lean();
}
