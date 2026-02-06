import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
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
  },
  { timestamps: true }
);

export type OrderDoc = {
  _id: string;
  orderNumber: string;
  userId: string | Schema.Types.ObjectId;
  items: Array<{
    productId: string | Schema.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  trackingNumber?: string;
  notes?: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export const Order = models.Order || model("Order", OrderSchema);
