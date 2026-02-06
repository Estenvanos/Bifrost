import { model, models, Schema, Types } from "mongoose";

const ReviewSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order" }, // verified purchase
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String },
        comment: { type: String },
        images: [{
            fileId: { type: Schema.Types.ObjectId },
            url: { type: String }
        }],
        verified: { type: Boolean, default: false },
        helpful: {
            count: { type: Number, default: 0 },
            userIds: [{ type: Schema.Types.ObjectId, ref: "User" }]
        },
        status: {
            type: String,
            enum: ['approved', 'pending', 'rejected'],
            default: 'pending',
            index: true
        }
    },
    { timestamps: true }
);

ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

export type ReviewDoc = {
    _id: string;
    productId: string | Types.ObjectId;
    userId: string | Types.ObjectId;
    orderId?: string | Types.ObjectId;
    rating: number;
    title?: string;
    comment?: string;
    images?: Array<{
        fileId?: Types.ObjectId;
        url?: string;
    }>;
    verified: boolean;
    helpful: {
        count: number;
        userIds: Array<string | Types.ObjectId>;
    };
    status: 'approved' | 'pending' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
};

export const Review = models.Review || model("Review", ReviewSchema);