"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = require("mongoose");
const CompanySchema = new mongoose_1.Schema({
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    logo: {
        fileId: { type: mongoose_1.Schema.Types.ObjectId },
        url: { type: String }
    },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
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
}, { timestamps: true });
exports.Company = mongoose_1.models.Company || (0, mongoose_1.model)("Company", CompanySchema);
