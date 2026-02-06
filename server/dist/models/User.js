"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer',
        index: true
    },
    phoneNumber: { type: String },
    addresses: [{
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            isDefault: { type: Boolean, default: false }
        }],
    stripeCustomerId: { type: String },
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    preferences: {
        newsletter: { type: Boolean, default: false },
        notifications: { type: Boolean, default: true }
    },
    lastLogin: { type: Date }
}, { timestamps: true });
exports.User = mongoose_1.models.User || (0, mongoose_1.model)("User", UserSchema);
