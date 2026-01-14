import { model, models, Schema } from "mongoose";

const ProductSchema = new Schema({
    product_name : { type: String, required: true },
    description : { type: String, required: true },
    price : { type: Number, required: true },
    category : { type: String, required: true, index : true },
    tags : { type: [String], default: [], index: true },
    vector : { type: [Number], default: [] },
    vector_version : { type: Number, default: 1 }
},
{ timestamps: true }
)

ProductSchema.index({ category: 1 });
ProductSchema.index({ "vector.0": 1 }); // fast "has vector" check



export type ProductDoc = {
    _id: string,
    product_name : string,
    description : string,
    price : number,
    category : string,
    tags : string[],
    createdAt: Date,
    updatedAt: Date
}

export const Product = models.Product || model("Product", ProductSchema);