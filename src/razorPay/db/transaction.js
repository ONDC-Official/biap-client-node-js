import mongoose from'mongoose';
import { uuid } from 'uuidv4';
import OrderHistory from "../../order/v2/db/orderHistory.js";

const transactionSchema = new mongoose.Schema({
    _id:{
        type: String,
        required:true,
        default: () => uuid(),
    },
    amount: {
        type:Number,
    },
    transactionId: {
        type:String,
    },
    paymentType: {
        type:String,
    },
    date: {
        type:Number,
    },
    status: {
        type:String,
    },
    orderId: {
        type:String,
    },
    humanReadableID: {
        type:String,
    },
    depositDate: {
        type: Number,
    },
    payment: {
        type: Object,
    }
},{
    strict: true,
    collation: { locale: 'en_US', strength: 1 }
});

const Transaction = mongoose.model('Transaction',transactionSchema);
export default Transaction;

