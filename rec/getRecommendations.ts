// src/recs/getRecommendations.ts
import { buildUserTasteVector } from "./userProfile";
import { formatItems } from "./format/formatItems";
import { getTrendingProducts } from "./db/getTrendingProducts";
import { rankByUserVector } from "./rank/rankByUserVector";
import { rankRelatedToProduct } from "./rank/rankRelatedToProduct";
import type { RecParams, RecommendationsResponse } from "@/types/recs";

export async function getRecommendations({
  userId,
  productId,
  kOverall = 10,
  kCategory = 8,
  kRelated = 8,
}: RecParams): Promise<RecommendationsResponse> {
  // 1) Build user profile (taste vector + seen items + top categories)
  const { userVec, seenIds, topCats } = await buildUserTasteVector(userId);

  // 2) Cold start fallback
  if (!userVec || userVec.length === 0) {
    return {
      overall: await getTrendingProducts(kOverall),
      topCategory: [],
      secondCategory: [],
      related: [],
      meta: { topCats: [] },
    };
  }

  const [cat1, cat2] = topCats ?? [];

  // 3) Rank blocks
  const overallRanked = await rankByUserVector({
    userVec,
    excludeIds: seenIds,
    candidateLimit: 1200,
    topK: kOverall,
  });

  const topCatRanked = cat1
    ? await rankByUserVector({
        userVec,
        excludeIds: seenIds,
        extraQuery: { category: cat1 },
        candidateLimit: 800,
        topK: kCategory,
      })
    : [];

  const secondCatRanked = cat2
    ? await rankByUserVector({
        userVec,
        excludeIds: seenIds,
        extraQuery: { category: cat2 },
        candidateLimit: 800,
        topK: kCategory,
      })
    : [];

  const relatedRanked = productId
    ? await rankRelatedToProduct({
        productId,
        topK: kRelated,
        candidateLimit: 800,
      })
    : [];

  // 4) Final response
  return {
    overall: formatItems(overallRanked as any, "overall_for_you"),
    topCategory: formatItems(topCatRanked as any, "top_category"),
    secondCategory: formatItems(secondCatRanked as any, "second_category"),
    related: formatItems(relatedRanked as any, "related_product_page"),
    meta: { topCats: topCats ?? [] },
  };
}
