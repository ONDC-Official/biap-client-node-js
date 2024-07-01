import mongoose from "mongoose";

const  CartSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        location_id: { type: String, required: true }
    },
    { 
        _id: true,
        timestamps: true
    }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const Cart  = mongoose.model('cart', CartSchema, "cart");

export default Cart;