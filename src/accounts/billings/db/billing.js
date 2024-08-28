import mongoose from "mongoose";

const defaultString = { type: String, default: null };
const defaultDate = { type: Date, default: null };

const OrganizationSchema = new mongoose.Schema(
    {
        name: defaultString,
        cred: defaultString,
    },
    { _id: false }
);

const AddressSchema = new mongoose.Schema(
    {
        door: defaultString,
        name: defaultString,
        building: defaultString,
        street: defaultString,
        locality: defaultString,
        ward: defaultString,
        city: defaultString,
        state: defaultString,
        country: defaultString,
        areaCode: defaultString,
        lat: defaultString,
        lng: defaultString,
    },
    { _id: false }
);

const TimeRangeSchema = new mongoose.Schema(
    {
        start: defaultDate,
        end: defaultDate,
    },
    { _id: false }
);

const TimeSchema = new mongoose.Schema(
    {
        label: defaultString,
        timestamp: defaultDate,
        duration: defaultString,
        range: { type: TimeRangeSchema, default: null },
        days: defaultString,
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
        email: defaultString,
        time: { type: TimeSchema, default: null },
        taxNumber: defaultString,
        locationId: defaultString,
        userId: String
    },
    { _id: true, timestamps: true }
);

const Billing = mongoose.model('Billing', BillingSchema, 'billing');

export default Billing;
