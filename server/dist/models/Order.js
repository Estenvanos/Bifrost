"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [{
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true }, // snapshot
            price: { type: Number, required: true }, // snapshot
            quantity: { type: Number, required: true },
            image: { type: String }
        }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
        index: true
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentMethod: { type: String },
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },
    trackingNumber: { type: String },
    notes: { type: String },
    statusHistory: [{
            status: String,
            timestamp: { type: Date, default: Date.now },
            note: String
        }]
}, { timestamps: true });
exports.Order = mongoose_1.models.Order || (0, mongoose_1.model)("Order", OrderSchema);
