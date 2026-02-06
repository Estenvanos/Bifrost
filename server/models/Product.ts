import { model, models, Schema } from "mongoose";

const ProductSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    cost: { type: Number }, // For internal use/vendors
    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String },
    quantity: { type: Number, default: 0 },

    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    category: { type: String, required: true, index: true },
    subCategory: { type: String },
    tags: { type: [String], index: true },

    images: [{
        fileId: { type: Schema.Types.ObjectId }, // GridFS
        url: { type: String },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],

    specifications: { type: Map, of: String },
    weight: { type: Number },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },

    status: {
        type: String,
        enum: ['active', 'draft', 'archived'],
        default: 'draft',
        index: true
    },

    seo: {
        title: { type: String },
        description: { type: String },
        keywords: { type: [String] }
    },

    ratings: {
        average: { type: Number, default: 0, index: true },
        count: { type: Number, default: 0 }
    },
    viewCount: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ companyId: 1, status: 1 });

export type ProductDoc = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    cost?: number;
    sku?: string;
    barcode?: string;
    quantity: number;
    companyId: Schema.Types.ObjectId | string;
    category: string;
    subCategory?: string;
    tags: string[];
    images: Array<{
        fileId?: Schema.Types.ObjectId;
        url: string;
        alt?: string;
        isPrimary: boolean;
    }>;
    specifications: Map<string, string>;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    status: 'active' | 'draft' | 'archived';
    seo: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
    ratings: {
        average: number;
        count: number;
    };
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export const Product = models.Product || model("Product", ProductSchema);