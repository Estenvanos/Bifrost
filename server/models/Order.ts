import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total_price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shipping_address: { type: String, required: true },
    ordered_at: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type OrderDoc = {
  _id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total_price: number;
  status: string;
  shipping_address: string;
  ordered_at: Date;
  createdAt: Date;
  updatedAt: Date;
};

export const Order = models.Order || model("Order", OrderSchema);
