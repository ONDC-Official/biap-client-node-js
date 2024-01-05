import mongoose from "mongoose";

const  CartSchema = new mongoose.Schema(
    {
        userId: { type: String }
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const Cart  = mongoose.model('cart', CartSchema, "cart");

export default Cart;