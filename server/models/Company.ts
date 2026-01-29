// models/Company.ts
import { model, models, Schema} from "mongoose";

const CompanySchema = new Schema(
  {
    company_name: { type: String, required: true, trim: true, index: true },
    owner_user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true, trim: true },
    website_url: { type: String, trim: true },
    logo_url: { type: String, trim: true },
    contact_email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, trim: true },
    phone_number: { type: String, trim: true },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CompanySchema.index({ contact_email: 1 }, { unique: true });

export type CompanyDoc = {
  _id: string;
  company_name: string;
  owner_user_id: string;
  description: string;
  website_url?: string;
  logo_url?: string;
  contact_email: string;
  address?: string;
  phone_number?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const Company = models.Company || model("Company", CompanySchema);
