import mongoose from'mongoose';
import { uuid } from 'uuidv4';

const refundSchema = new mongoose.Schema({
    _id:{
        type: String,
        required:true,
        default: () => uuid(),
    },
    amount: {
        type:Number,
    },
    status: {
        type:String,
    },
    orderId: {
        type:String,
    },
    paymentId: {
        type:String,
    },
},{
    strict: true,
    collation: { locale: 'en_US', strength: 1 }
});

const Refund = mongoose.model('Refund',refundSchema);
export default Refund;

