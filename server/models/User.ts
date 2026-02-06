import { model, models, Schema, Types } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
      index: true
    },
    phoneNumber: { type: String },
    addresses: [{
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: { type: Boolean, default: false }
    }],
    stripeCustomerId: { type: String },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    preferences: {
      newsletter: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true }
    },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'vendor' | 'admin';
  phoneNumber?: string;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    _id?: string;
  }>;
  stripeCustomerId?: string;
  companyId?: string | Types.ObjectId;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export const User = models.User || model("User", UserSchema);
