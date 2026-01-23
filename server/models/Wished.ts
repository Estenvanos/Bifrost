import { model, models, Schema } from "mongoose";

const WishedSchema = new Schema({
    user_id : { type: String, required: true },
    product_id : { type: String, required: true },
}, { timestamps: true })

export type WishedDoc = {
    _id: string,
    user_id : string,
    product_id : string,
    createdAt: Date,
    updatedAt: Date
}

export const Wished = models.Wished || model("Wished", WishedSchema);