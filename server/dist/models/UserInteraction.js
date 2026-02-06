"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInteraction = void 0;
const mongoose_1 = require("mongoose");
const UserInteractionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    interactionType: {
        type: String,
        enum: ['view', 'add_to_cart', 'purchase', 'wishlist', 'search'],
        required: true
    },
    weight: { type: Number, required: true }, // scoring: view=1, cart=3, wishlist=2, purchase=5, search=1
    metadata: {
        searchQuery: String,
        sessionId: String,
        referrer: String,
        duration: Number
    },
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
// Indexes (Critical for recommendation performance)
UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ productId: 1, timestamp: -1 });
UserInteractionSchema.index({ userId: 1, interactionType: 1 });
UserInteractionSchema.index({ userId: 1, productId: 1, interactionType: 1 });
exports.UserInteraction = mongoose_1.models.UserInteraction || (0, mongoose_1.model)("UserInteraction", UserInteractionSchema);
