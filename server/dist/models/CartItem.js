"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
const mongoose_1 = require("mongoose");
const CartItemSchema = new mongoose_1.Schema({
    cart_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Cart", required: true },
    product_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 },
    added_at: { type: Date, default: Date.now }
}, { timestamps: true });
exports.CartItem = mongoose_1.models.CartItem || (0, mongoose_1.model)("CartItem", CartItemSchema);
