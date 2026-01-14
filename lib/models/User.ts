import { model, models, Schema } from "mongoose";

const UserSchema = new Schema({
    username : { type: String, required: true },
    email    : { type: String, required: true, unique: true },
    password : { type: String, required: true },
    last_viewed_product_id : {type : String}
}, { timestamps: true })

export type UserDoc = {
    _id: string,
    username : string,
    email    : string,
    password : string,
    last_viewed_product_id : string
    createdAt: Date,
    updatedAt: Date
}

export const User = models.User || model("User", UserSchema);