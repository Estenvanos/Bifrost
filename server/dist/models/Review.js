"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Order" }, // verified purchase
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String },
    images: [{
            fileId: { type: mongoose_1.Schema.Types.ObjectId },
            url: { type: String }
        }],
    verified: { type: Boolean, default: false },
    helpful: {
        count: { type: Number, default: 0 },
        userIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }]
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
        index: true
    }
}, { timestamps: true });
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
exports.Review = mongoose_1.models.Review || (0, mongoose_1.model)("Review", ReviewSchema);
