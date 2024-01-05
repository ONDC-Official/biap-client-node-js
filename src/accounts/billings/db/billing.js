import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        cred: { type: String, default: null },
    },
    { _id: false }
);

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
        lat:{ type: String, default: null },
        lng:{ type: String, default: null }
    },
    { _id: false }
);

const TimeRangeSchema = new mongoose.Schema(
    {
        start: { type: Date, default: null },
        end: { type: Date, default: null },
    },
    { _id: false }
);

const TimeSchema = new mongoose.Schema(
    {
        label: { type: String, default: null },
        timestamp: { type: Date, default: null },
        duration: { type: String, default: null },
        range: { type: TimeRangeSchema, default: null },
        days: { type: String, default: null },
    },
    { _id: false }
);

const BillingSchema = new mongoose.Schema(
    {
        id: String,
        name: { type: String, required: true },
        phone: { type: String, required: true },
        organization: { type: OrganizationSchema, default: null },
        address: { type: AddressSchema, default: null },
        email: { type: String, default: null },
        time: { type: TimeSchema, default: null },
        taxNumber: { type: String, default: null },
        locationId: { type: String, default: null },
        userId: String
    },
    { _id: true, timestamps: true }
);

const Billing = mongoose.model('billing', BillingSchema, "billing");

export default Billing;