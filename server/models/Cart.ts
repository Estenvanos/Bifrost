import { model, models, Schema, Types } from "mongoose";

const CartSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CartDoc = {
  _id: string;
  user_id: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const Cart = models.Cart || model("Cart", CartSchema);
