"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
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
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    category: { type: String, required: true, index: true },
    subCategory: { type: String },
    tags: { type: [String], index: true },
    images: [{
            fileId: { type: mongoose_1.Schema.Types.ObjectId }, // GridFS
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
exports.Product = mongoose_1.models.Product || (0, mongoose_1.model)("Product", ProductSchema);
