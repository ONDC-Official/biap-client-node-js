import mongoose from "mongoose";

const  RetrialSchema = new mongoose.Schema(
    {
        retrial: {type:Number},
        transactionId: { type: String }
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const Retrial  = mongoose.model('retrial', RetrialSchema, "retrial");

export default Retrial;