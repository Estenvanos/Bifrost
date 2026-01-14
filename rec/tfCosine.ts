type VectorItem = {
  vector: number[];
  [key: string]: any;
};

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Returns top K items ranked by cosine similarity
 */
export function cosineTopK<T extends VectorItem>(
  baseVector: number[],
  candidates: T[],
  k: number
): (T & { score: number })[] {
  return candidates
    .map((item) => ({
      ...item,
      score: cosineSimilarity(baseVector, item.vector),
    }))
    .filter((i) => i.score > 0) 
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
