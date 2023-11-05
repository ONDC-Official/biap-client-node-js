import mongoose from "mongoose";

const  Settlement = new mongoose.Schema(
    {
        fulfillmentId: { type: String },
        orderId:{ type: String },
        settlement:{ type: Object },

    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const Settlements  = mongoose.model('settlement', Settlement, "settlement");

export default Settlements;