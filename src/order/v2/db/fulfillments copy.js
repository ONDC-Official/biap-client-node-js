import mongoose from "mongoose";

const  RatingModel = new mongoose.Schema(
    {

        orderId:{ type: String },
        entityId:{ type: String },
        rating:{ type: String },
        type:{ type: String },
    },
    { _id: true, timestamps: true }
);


const Rating  = mongoose.model('rating', RatingModel, "rating");

export default Rating;