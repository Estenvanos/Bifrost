export type RecParams = {
  userId: string;
  productId?: string;
  kOverall?: number;
  kCategory?: number;
  kRelated?: number;
};

export type RecItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  review_count?: number;
  score?: number;
  reason: string;
};

export type ProductLean = {
  _id: string;
  product_name: string;
  price: number;
  category: string;
  rating?: number;
  review_count?: number;
  vector?: number[];
  score?: number;
};

export type RecommendationsResponse = {
  overall: RecItem[];
  topCategory: RecItem[];
  secondCategory: RecItem[];
  related: RecItem[];
  meta: { topCats: string[] };
};
