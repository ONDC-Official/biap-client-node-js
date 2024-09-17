import mongoose from "mongoose";

const  WishListSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        location_id: { type: String, required: false }
    },
    { 
        _id: true,
        timestamps: true
    }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const WishList  = mongoose.model('wishList', WishListSchema, "wishList");

export default WishList;