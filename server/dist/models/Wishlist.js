"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wishlist = void 0;
const mongoose_1 = require("mongoose");
const WishlistSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: [
        {
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
            addedAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });
WishlistSchema.index({ "items.productId": 1 });
exports.Wishlist = mongoose_1.models.Wishlist || (0, mongoose_1.model)("Wishlist", WishlistSchema);
