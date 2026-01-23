import { model, models, Schema } from "mongoose";

const ProductSchema = new Schema({
    product_name : { type: String, required: true },
    company_id: { type: String, required : true },
    description : { type: String, required: true },
    image_url : { type: String },
    price : { type: Number, required: true },
    category : { type: String, required: true, index : true },
    rating : { type: Number, default: 0 },
    review_count : { type: Number, default: 0 },
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
    company_id: string,
    description : string,
    price : number,
    category : string,
    tags : string[],
    rating : number,
    review_count : number,
    createdAt: Date,
    updatedAt: Date
}

export const Product = models.Product || model("Product", ProductSchema);