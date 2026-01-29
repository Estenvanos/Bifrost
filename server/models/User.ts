import { model, models, Schema, Types } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    type: { type: String, enum: ["customer", "admin", "owner"], default: "customer" },
    password: { type: String, required: true },
    last_viewed_product_id: {
      type: Types.ObjectId,
      ref: "Product",
      default: null,
    },
    company_id: {
      type: Types.ObjectId,
      ref: "Company",
      default: null,
    },
  },
  { timestamps: true },
);

export type UserDoc = {
  _id: string;
  username: string;
  email: string;
  type: "customer" | "admin" | "owner";
  password: string;
  company_id: string | null;
  last_viewed_product_id: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const User = models.User || model("User", UserSchema);
