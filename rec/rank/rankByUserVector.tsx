import { fetchVectorCandidates } from "../db/fetchVectorCandidates";
import { cosineTopK } from "../tfCosine";

export async function rankByUserVector(params: {
  userVec: number[];
  excludeIds: Set<string>;
  extraQuery?: any;
  candidateLimit: number;
  topK: number;
}) {
  const { userVec, excludeIds, extraQuery = {}, candidateLimit, topK } = params;

  const candidates = await fetchVectorCandidates(
    { _id: { $nin: Array.from(excludeIds) }, ...extraQuery },
    candidateLimit
  );

  return cosineTopK(userVec, candidates, topK);
}
