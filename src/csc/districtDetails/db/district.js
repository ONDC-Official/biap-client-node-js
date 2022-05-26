import mongoose from "mongoose";

const CitySchema = new mongoose.Schema(
    {
        cityName: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    { _id: false }
);

const DistrictSchema = new mongoose.Schema(
    {
        districtCode: { type: Number, required: true },
        districtName: { type: String, required: true },
        cities: { type: [CitySchema], default: null },
    },
    { _id: true, timestamps: true }
);

DistrictSchema.index({districtCode: -1, createdAt: -1});

const District = mongoose.model('district_details', DistrictSchema, "district_details");

export default District;