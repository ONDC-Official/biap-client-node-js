import mongoose from "mongoose";
import WishList from "./wishlist.js";

const  WishListItemSchema = new mongoose.Schema(
    {
        item: { type: Object },
        wishlist:{type:String, ref:'WishList'}
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const WishListItem  = mongoose.model('wishListItem', WishListItemSchema, "wishListItem");

export default WishListItem;