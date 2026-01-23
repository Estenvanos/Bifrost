import { model, models, Schema } from "mongoose";

const CartItemSchema = new Schema({
    cart_id : { type: Schema.Types.ObjectId, ref: "Cart", required: true },
    product_id : { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity : { type: Number, required: true, default: 1 },
    added_at : { type: Date, default: Date.now }
}, { timestamps: true })

export type CartItemDoc = {
    _id: string,
    cart_id : string,
    product_id : string,
    quantity : number,
    added_at : Date
    createdAt: Date,
    updatedAt: Date
}

export const CartItem = models.CartItem || model("CartItem", CartItemSchema);