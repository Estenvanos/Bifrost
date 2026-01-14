import { UserInteraction } from "@/lib/models/UserInteraction";
import { Product } from "@/lib/models/Product";

type UserTasteResult = {
  userVec: number[] | null;
  seenIds: Set<string>;
  topCats: string[];
};

/**
 * Builds a user preference vector based on past interactions
 */
export async function buildUserTasteVector(userId: string): Promise<UserTasteResult> {
  const interactions = await UserInteraction.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(200) // limit to recent behavior
    .lean();

  if (!interactions.length) {
    return {
      userVec: null,
      seenIds: new Set(),
      topCats: [],
    };
  }

  // Collect product IDs (ignore searches)
  const productIds = interactions
    .filter((i: any) => i.product_id)
    .map((i: any) => i.product_id);

  const products = await Product.find({
    _id: { $in: productIds },
    "vector.0": { $exists: true },
  })
    .select("_id vector category")
    .lean();

  if (!products.length) {
    return {
      userVec: null,
      seenIds: new Set(productIds),
      topCats: [],
    };
  }

  const productMap = new Map(
    products.map((p: any) => [p._id.toString(), p])
  );

  let userVector: number[] | null = null;
  const seenIds = new Set<string>();
  const categoryScore: Record<string, number> = {};

  for (const interaction of interactions) {
    const product = productMap.get(interaction.product_id);
    if (!product) continue;

    const weight = interactionWeight(interaction);
    if (weight <= 0) continue;

    seenIds.add(product._id.toString());

    // Track category interest
    categoryScore[product.category] =
      (categoryScore[product.category] || 0) + weight;

    // Initialize user vector
    if (!userVector) {
      userVector = new Array(product.vector.length).fill(0);
    }

    // Weighted vector sum
    for (let i = 0; i < product.vector.length; i++) {
      userVector[i] += product.vector[i] * weight;
    }
  }

  if (!userVector) {
    return {
      userVec: null,
      seenIds,
      topCats: [],
    };
  }

  normalizeVector(userVector);

  const topCats = Object.entries(categoryScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  return {
    userVec: userVector,
    seenIds,
    topCats,
  };
}

/* ---------------- helpers ---------------- */

function interactionWeight(interaction: any): number {
  switch (interaction.interaction_type) {
    case "purchase":
      return 3;
    case "add_to_cart":
      return 2;
    case "like":
      return 1.5;
    case "rating":
      return interaction.rating ? interaction.rating / 5 : 0;
    default:
      return 0; // search or unknown
  }
}

function normalizeVector(vec: number[]) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return;

  for (let i = 0; i < vec.length; i++) {
    vec[i] /= norm;
  }
}
