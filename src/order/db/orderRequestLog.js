import mongoose from "mongoose";

const OrderRequestLogSchema = new mongoose.Schema(
    {
        transactionId: {type:String},
        messageId: {type:String},
        request: {type:Object},
        requestType:{type:String}
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const OrderRequestLog = mongoose.model('orderRequestLog', OrderRequestLogSchema, "orderRequestLog");

export default OrderRequestLog;