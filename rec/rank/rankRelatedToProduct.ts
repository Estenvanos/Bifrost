import { Product } from "@/lib/models/Product";
import { cosineTopK } from "../tfCosine";
import { fetchVectorCandidates } from "../db/fetchVectorCandidates";

export async function rankRelatedToProduct(params: {
  productId: string;
  topK: number;
  candidateLimit: number;
}) {
  const base = await Product.findById(params.productId)
    .select("_id vector category")
    .lean();

  if (!base?.vector?.length) return [];

  const candidates = await fetchVectorCandidates(
    { _id: { $ne: base._id }, category: base.category },
    params.candidateLimit
  );

  return cosineTopK(base.vector, candidates, params.topK);
}
