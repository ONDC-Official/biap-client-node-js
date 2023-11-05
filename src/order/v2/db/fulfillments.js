import mongoose from "mongoose";

const  Fulfillment = new mongoose.Schema(
    {
        itemId: { type: String },
        orderId:{ type: String },
        parent_item_id:{ type: String },
        item_quantity:{ type: Number },
        reason_id:{ type: Number },
        reason_desc:{ type: String},
        images:{ type: String },
        type:{ type: String },
        state:{ type: Object },
        start:{ type: Object },
        quote_trail:{ type: Object },
        id:{ type: String }
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const Fulfillments  = mongoose.model('fulfillment', Fulfillment, "fulfillment");

export default Fulfillments;