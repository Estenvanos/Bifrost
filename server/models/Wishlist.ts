import { model, models, Schema, Types } from "mongoose";

const WishlistSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                addedAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

WishlistSchema.index({ "items.productId": 1 });

export type WishlistDoc = {
    _id: string;
    userId: string | Types.ObjectId;
    items: Array<{
        productId: string | Types.ObjectId;
        addedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
};

export const Wishlist = models.Wishlist || model("Wishlist", WishlistSchema);
