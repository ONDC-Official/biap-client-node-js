import mongoose from "mongoose";
import logger from '../path/to/your/logger.js'; // Adjust the path to your logger

/**
 * Schema for Address
 *
 * door: Door number
 * name: Name of the address holder
 * building: Building name
 * street: Street name
 * locality: Locality name
 * ward: Ward name
 * city: City name
 * state: State name
 * country: Country name
 * areaCode: Area code
 * tag: Tag for the address
 * lat: Latitude
 * lng: Longitude
 */
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
            tag: { type: String, default: null },
            lat: { type: String, default: null },
            lng: { type: String, default: null }
    },
    { _id: false }
);

/**
 * Schema for Descriptor
 *
 * name: Name of the descriptor
 * phone: Phone number
 * email: Email address
 * code: Code for the descriptor
 * symbol: Symbol representation
 * shortDesc: Short description
 * longDesc: Long description
 * images: Array of image URLs
 * audio: Audio file URL
 * 3d_render: URL for 3D render
 */
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

/**
 * Schema for Delivery Address
 *
 * userId: ID of the user
 * id: Unique identifier for the delivery address
 * descriptor: Descriptor details
 * gps: GPS coordinates
 * defaultAddress: Flag indicating if this is the default address
 * address: Address details
 */
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

logger.info('DeliveryAddress model has been initialized.');

export default DeliveryAddress;
