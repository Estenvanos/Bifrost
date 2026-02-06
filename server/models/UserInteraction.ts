import { model, models, Schema, Types } from "mongoose";

const UserInteractionSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        interactionType: {
            type: String,
            enum: ['view', 'add_to_cart', 'purchase', 'wishlist', 'search'],
            required: true
        },
        weight: { type: Number, required: true }, // scoring: view=1, cart=3, wishlist=2, purchase=5, search=1
        metadata: {
            searchQuery: String,
            sessionId: String,
            referrer: String,
            duration: Number
        },
        timestamp: { type: Date, default: Date.now, index: true }
    },
    { timestamps: true }
);

// Indexes (Critical for recommendation performance)
UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ productId: 1, timestamp: -1 });
UserInteractionSchema.index({ userId: 1, interactionType: 1 });
UserInteractionSchema.index({ userId: 1, productId: 1, interactionType: 1 });

export type UserInteractionDoc = {
    _id: string;
    userId: string | Types.ObjectId;
    productId: string | Types.ObjectId;
    interactionType: 'view' | 'add_to_cart' | 'purchase' | 'wishlist' | 'search';
    weight: number;
    metadata?: {
        searchQuery?: string;
        sessionId?: string;
        referrer?: string;
        duration?: number;
    };
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
};

export const UserInteraction = models.UserInteraction || model("UserInteraction", UserInteractionSchema);