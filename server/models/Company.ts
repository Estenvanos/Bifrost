import { model, models, Schema, Types } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    logo: {
      fileId: { type: Schema.Types.ObjectId },
      url: { type: String }
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    taxId: { type: String },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'pending',
      index: true
    },
    stripeAccountId: { type: String },
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export type CompanyDoc = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: {
    fileId?: Schema.Types.ObjectId;
    url?: string;
  };
  ownerId: string | Types.ObjectId;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  status: 'active' | 'suspended' | 'pending';
  stripeAccountId?: string;
  stats: {
    totalProducts: number;
    totalSales: number;
    rating: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export const Company = models.Company || model("Company", CompanySchema);
