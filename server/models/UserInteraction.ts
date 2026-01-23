import { model, models, Schema } from "mongoose";

const UserInteractionSchema  = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    interaction_type: { type: String, enum : ["purchase", "add_to_cart", "like", "rating", "search"], required: true },
    rating : { type: Number, min: 1, max: 5},
    query : { type: String, }, 
    meta : {
        source : { type: String },
    }
}, { timestamps: true })

export const UserInteraction = models.UserInteraction || model("UserInteraction", UserInteractionSchema);