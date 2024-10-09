import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
    {
        door: { type: String, default: null },
        name: { type: String, default: null },
        building: { type: String, default: null },
        street: { type: String, default: null },
        locality: { type: String, default: null },
        ward: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        areaCode: { type: String, default: null },
        tag:{ type: String, default: null },
        lat:{ type: String, default: null },
        lng:{ type: String, default: null }
    },
    { _id: false }
);

const DescriptorSchema = new mongoose.Schema(
    {
        name: String,
        phone: { type: String, default: null },
        email: { type: String, default: null },
        code: { type: String, default: null },
        symbol: { type: String, default: null },
        shortDesc: { type: String, default: null },
        longDesc: { type: String, default: null },
        images: { type: [String], default: null },
        audio: { type: String, default: null },
        "3d_render": { type: String, default: null }
    },
    { _id: false }
);

const DeliveryAddressSchema = new mongoose.Schema(
    {
        userId: String,
        id: { type: String, required: true },
        descriptor: { type: DescriptorSchema, default: null },
        gps: { type: String, default: null },
        defaultAddress: { type: Boolean, default: true },
        address: { type: AddressSchema, default: null },
    },
    { _id: true, timestamps: true }
);

const DeliveryAddress = mongoose.model('delivery_address', DeliveryAddressSchema, "delivery_address");

export default DeliveryAddress;