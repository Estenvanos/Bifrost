"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const CartSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
}, { timestamps: true });
exports.Cart = mongoose_1.models.Cart || (0, mongoose_1.model)("Cart", CartSchema);
