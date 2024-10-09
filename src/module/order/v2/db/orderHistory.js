import mongoose from "mongoose";

const  OrdersHistory = new mongoose.Schema(
    {
        orderId:{ type: String },
        updatedAt:{ type: String },
        state:{ type: Object },
        id:{ type: String }
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const OrderHistory  = mongoose.model('ordersHistory', OrdersHistory, "ordersHistory");

export default OrderHistory;