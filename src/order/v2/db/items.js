import mongoose from "mongoose";

const  CartItemSchema = new mongoose.Schema(
    {
        item: { type: Object },
        cart:{type:String, ref:'Cart'}
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const CartItem  = mongoose.model('cartItem', CartItemSchema, "cartItem");

export default CartItem;