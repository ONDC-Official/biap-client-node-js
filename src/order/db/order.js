import mongoose from "mongoose";

const AddOnsSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
    },
    { _id: false }
);

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
        areaCode: { type: String, default: null }
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
        locationId: { type: String, default: null }
    },
    { _id: false, timestamps: true }
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

const StateSchema = new mongoose.Schema(
    {
        descriptor: { type: DescriptorSchema, default: null },
        updatedAt: { type: Date, default: null },
        updatedBy: { type: String, default: null },
    },
    { _id: false }
);

const PersonSchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        image: { type: String, default: null },
        dob: { type: Date, default: null },
        gender: { type: String, default: null },
        cred: { type: String, default: null },
        tags: { type: Map, default: null },
    },
    { _id: false }
);

const VehicleSchema = new mongoose.Schema(
    {
        category: { type: String, default: null },
        capacity: { type: Number, default: null },
        make: { type: String, default: null },
        model: { type: String, default: null },
        size: { type: String, default: null },
        variant: { type: String, default: null },
        color: { type: String, default: null },
        energyType: { type: String, default: null },
        registration: { type: String, default: null }
    },
    { _id: false }
);

const CitySchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        code: { type: String, default: null }
    },
    { _id: false }
);

const CountrySchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        code: { type: String, default: null }
    },
    { _id: false }
);

const ScalarRangeSchema = new mongoose.Schema(
    {
        min: { type: mongoose.Decimal128, default: null },
        max: { type: mongoose.Decimal128, default: null },
    },
    { _id: false }
);

const ScalarSchema = new mongoose.Schema(
    {
        value: { type: mongoose.Decimal128, required: true },
        unit: { type: String, required: true },
        type: { type: String, enum: ['CONSTANT', 'VARIABLE'], default: null },
        estimatedValue: { type: mongoose.Decimal128, default: null },
        computedValue: { type: mongoose.Decimal128, default: null },
        range: { type: ScalarRangeSchema, default: null },
    },
    { _id: false }
);

const CircleSchema = new mongoose.Schema(
    {
        radius: { type: ScalarSchema, default: null },
    },
    { _id: false }
);

const LocationSchema = new mongoose.Schema(
    {
        id: { type: String, default: null },
        descriptor: { type: DescriptorSchema, default: null },
        gps: { type: String, default: null },
        address: { type: AddressSchema, default: null },
        stationCode: { type: String, default: null },
        city: { type: CitySchema, default: null },
        country: { type: CountrySchema, default: null },
        circle: { type: CircleSchema, default: null },
        polygon: { type: String, default: null },
        "3dspace": { type: String, default: null }
    },
    { _id: false }
);

const ContactSchema = new mongoose.Schema(
    {
        phone: { type: String, default: null },
        email: { type: String, default: null },
        tags: { type: Map, default: null }
    },
    { _id: false }
);

const FulfillmentStartSchema = new mongoose.Schema(
    {
        location: { type: LocationSchema, default: null },
        time: { type: TimeSchema, default: null },
        instructions: { type: DescriptorSchema, default: null },
        contact: { type: ContactSchema, default: null }
    },
    { _id: false }
);

const FulfillmentEndSchema = new mongoose.Schema(
    {
        location: { type: LocationSchema, default: null },
        time: { type: TimeSchema, default: null },
        instructions: { type: DescriptorSchema, default: null },
        contact: { type: ContactSchema, default: null }
    },
    { _id: false }
);

const CustomerSchema = new mongoose.Schema(
    {
        person: { type: PersonSchema, default: null },
        contact: { type: ContactSchema, default: null }
    },
    { _id: false }
);

const FulfillmentSchema = new mongoose.Schema(
    {
        id: { type: String, default: null },
        type: { type: String, default: null },
        state: { type: StateSchema, default: null },
        tracking: { type: Boolean, default: null },
        agent: { type: PersonSchema, default: null },
        vehicle: { type: VehicleSchema, default: null },
        start: { type: FulfillmentStartSchema, default: null },
        end: { type: FulfillmentEndSchema, default: null },
        purpose: { type: String, default: null },
        customer: { type: CustomerSchema, default: null },
        tags: { type: Map, default: null },
    },
    { _id: false }
);

const ProviderLocationSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
    },
    { _id: false }
);

const ProviderSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        locations: [ProviderLocationSchema]
    },
    { _id: false }
);

const ItemQuantityAllocatedSchema = new mongoose.Schema(
    {
        count: { type: Number, default: null },
        measure: { type: ScalarSchema, default: null },
    },
    { _id: false }
);

const ItemsSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        quantity: { type: ItemQuantityAllocatedSchema, required: true }
    },
    { _id: false }
);

const OfferSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
    },
    { _id: false }
);

const PriceSchema = new mongoose.Schema(
    {
        currency: { type: String, default: null },
        value: { type: String, default: null },
        estimated_value: { type: String, default: null },
        computed_value: { type: String, default: null },
        listed_value: { type: String, default: null },
        offered_value: { type: String, default: null },
        minimum_value: { type: String, default: null },
        maximum_value: { type: String, default: null },
    },
    { _id: false }
);

const QuotationBreakupSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['item', 'offer', 'add-on', 'fulfillment'], default: null },
        refId: { type: String, default: null },
        title: { type: String, default: null },
        price: { type: PriceSchema, default: null }
    },
    { _id: false }
);

const QuotationSchema = new mongoose.Schema(
    {
        price: { type: PriceSchema, default: null },
        breakup: { type: [QuotationBreakupSchema], default: null },
        ttl: { type: String, default: null }
    },
    { _id: false }
);

const PaymentSchema = mongoose.Schema(
    {
        uri: { type: String, default: null },
        tlMethod: { type: String, enum: ['http/get', 'http/post'], default: null },
        params: { type: Map, default: null },
        type: { type: String, enum: ['ON-ORDER', 'PRE-FULFILLMENT', 'ON-FULFILLMENT', 'POST-FULFILLMENT'], default: null },
        status: { type: String, enum: ['PAID', 'NOT-PAID'], default: null },
        time: { type: TimeSchema, default: null }
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        provider: { type: ProviderSchema, default: null },
        items: { type: [ItemsSchema], default: null },
        addOns: { type: [AddOnsSchema], default: null },
        offers: { type: [OfferSchema], default: null },
        billing: { type: BillingSchema, default: null },
        fulfillment: { type: FulfillmentSchema, default: null },
        quote: { type: QuotationSchema, default: null },
        payment: { type: PaymentSchema, default: null },
        id: { type: String, default: null },
        state: { type: String, default: null },
        userId: String,
        transactionId: { type: String, default: null },
        messageId: { type: String, default: null },
        parentOrderId: { type: String, default: null },
        bppId: { type: String, default: null },
    },
    { _id: true, timestamps: true }
);

OrderSchema.index({userId: 1, createdAt: -1});

const Order = mongoose.model('order', OrderSchema, "order");

export default Order;