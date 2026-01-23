import { model, models, Schema } from "mongoose";

const ReviewSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

export type ReviewDoc = {
    _id: string,
    user_id: string,
    product_id: string,
    comment: string,
    createdAt: Date,
    updatedAt: Date
}

export const Review = models.Review || model("Review", ReviewSchema);