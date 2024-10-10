import { v4 as uuidv4 } from 'uuid';
import NoRecordFoundError from '../../../lib/errors/no-record-found.error.js';
import admin from 'firebase-admin';
import DeliveryAddressMongooseModel from './db/deliveryAddress.js';
import axios from 'axios';
import logger from '../../../lib/logger/index.js'; // Adjust the path to your logger

class DeliveryAddressService {

    /**
     * Add a delivery address
     *
     * @param {Object} request - The request object containing address details
     * @param {Object} user - The user object containing user information
     * @returns {Object} - The created delivery address object
     */
    async deliveryAddress(request = {}, user = {}) {
        try {
            const deliveryAddressSchema = {
                userId: user?.decodedToken?.uid,
                id: uuidv4(),
                descriptor: request?.descriptor,
                gps: request?.gps,
                defaultAddress: true,
                address: request?.address,
                lat: request?.lat,
                lng: request?.lng
            };

            await DeliveryAddressMongooseModel.updateMany(
                { userId: user.decodedToken.uid },
                { defaultAddress: false }
            );

            let storedDeliveryAddress = await DeliveryAddressMongooseModel.create(
                { ...deliveryAddressSchema }
            );
            storedDeliveryAddress = storedDeliveryAddress?.toJSON();

            this.syncUserWithOMS(user?.decodedToken?.uid, request?.address, false);

            logger.info('Delivery address added successfully:', storedDeliveryAddress);

            return {
                id: storedDeliveryAddress?.id,
                descriptor: storedDeliveryAddress?.descriptor,
                gps: storedDeliveryAddress?.gps,
                defaultAddress: storedDeliveryAddress?.defaultAddress,
                address: storedDeliveryAddress?.address,
                lat: storedDeliveryAddress?.lat,
                lng: storedDeliveryAddress?.lng
            };
        } catch (err) {
            logger.error('Error adding delivery address:', err);
            throw err;
        }
    }

    /**
     * Get delivery address details
     *
     * @param {Object} user - The user object containing user information
     * @returns {Array} - An array of delivery address details
     */
    async onDeliveryAddressDetails(user = {}) {
        try {
            const deliveryAddressDetails = await DeliveryAddressMongooseModel.find({
                userId: user?.decodedToken?.uid
            });

            logger.info('Retrieved delivery address details:', deliveryAddressDetails);
            return deliveryAddressDetails;
        } catch (err) {
            logger.error('Error retrieving delivery address details:', err);
            throw err;
        }
    }

    /**
     * Update a delivery address
     *
     * @param {String} id - The ID of the delivery address to update
     * @param {Object} request - The request object containing updated address details
     * @param {String} userId - The user ID of the address owner
     * @returns {Object} - The updated delivery address object
     */
    async updateDeliveryAddress(id, request = {}, userId) {
        try {
            const deliveryAddressSchema = {
                descriptor: request?.descriptor,
                gps: request?.gps,
                defaultAddress: request?.defaultAddress,
                address: request?.address,
                lat: request?.lat,
                lng: request?.lng
            };

            if (request?.defaultAddress) {
                await DeliveryAddressMongooseModel.updateMany(
                    { userId: userId },
                    { defaultAddress: false }
                );
            }

            let storedDeliveryAddress = await DeliveryAddressMongooseModel.findOneAndUpdate(
                { id: id },
                { ...deliveryAddressSchema },
                {
                    returnDocument: "after",
                }
            );
            storedDeliveryAddress = storedDeliveryAddress?.toJSON();

            this.syncUserWithOMS(userId, request?.address, false);

            if (storedDeliveryAddress) {
                logger.info('Delivery address updated successfully:', storedDeliveryAddress);
                return {
                    id: storedDeliveryAddress?.id,
                    descriptor: storedDeliveryAddress?.descriptor,
                    gps: storedDeliveryAddress?.gps,
                    defaultAddress: storedDeliveryAddress?.defaultAddress,
                    address: storedDeliveryAddress?.address,
                    lat: storedDeliveryAddress?.lat,
                    lng: storedDeliveryAddress?.lng
                };
            } else {
                logger.warn(`Delivery address with ID ${id} not found`);
                throw new NoRecordFoundError(`Delivery address with ID ${id} not found`);
            }
        } catch (err) {
            logger.error('Error updating delivery address:', err);
            throw err;
        }
    }

    /**
     * Synchronize user details with the Order Management System (OMS)
     *
     * @param {String} userId - The user ID
     * @param {Object} deliveryAddress - The delivery address object
     * @param {Boolean} update - Indicates if this is an update operation
     * @returns {Object} - The sync JSON object
     */
    async syncUserWithOMS(userId, deliveryAddress, update = false) {
        let userJSON = await admin.auth().getUser(userId);
        userJSON = userJSON.toJSON();

        const syncjson = {
            user: {
                email: userJSON.email,
                displayName: userJSON.displayName,
                phoneNumber: userJSON.phoneNumber,
                uid: userJSON.uid
            },
            address: {
                userId: userId,
                refId: deliveryAddress.id,
                door: deliveryAddress.door,
                building: deliveryAddress.building,
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                country: deliveryAddress.country,
                areaCode: deliveryAddress.areaCode,
                tag: deliveryAddress.tag,
                lat: deliveryAddress.lat,
                lng: deliveryAddress.lng
            },
            update: update
        };

        logger.info('Syncing user with OMS:', syncjson);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.OMS_URL}/api/ondcUsers`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: syncjson
        };

        try {
            const response = await axios.request(config);
            logger.info('OMS response:', response.data);
        } catch (error) {
            logger.error('Error syncing user with OMS:', error);
        }

        return syncjson;
    }
}

export default DeliveryAddressService;
