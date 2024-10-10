import { v4 as uuidv4 } from 'uuid';
import NoRecordFoundError from '../../../lib/errors/no-record-found.error.js';
import logger from '../../../lib/logger/index.js'; // Import the logger

import BillingMongooseModel from './db/billing.js';

class BillingService {

    /**
     * Adds a billing address.
     * @param {Object} request - The billing address details.
     * @param {Object} user - The user object containing the user's information.
     * @returns {Promise<Object>} The created billing address.
     */
    async billingAddress(request = {}, user = {}) {
        try {
            const billingSchema = {
                id: uuidv4(),
                userId: user?.decodedToken?.uid,
                address: { ...request?.address },
                organization: request?.organization,
                locationId: request?.locationId,
                email: request?.email,
                phone: request?.phone,
                taxNumber: request?.taxNumber,
                name: request?.name,
                lat: request?.lat,
                lng: request?.lng
            };

            let storedBillingAddress = await BillingMongooseModel.create({ ...billingSchema });
            storedBillingAddress = storedBillingAddress?.toJSON();

            logger.info(`Billing address added successfully for user: ${user?.decodedToken?.uid}`);

            return {
                id: storedBillingAddress?.id,
                address: { ...storedBillingAddress?.address },
                organization: storedBillingAddress?.organization,
                locationId: storedBillingAddress?.locationId,
                email: storedBillingAddress?.email,
                phone: storedBillingAddress?.phone,
                taxNumber: storedBillingAddress?.taxNumber,
                name: storedBillingAddress?.name,
                lat: storedBillingAddress?.lat,
                lng: storedBillingAddress?.lng
            };
        } catch (err) {
            logger.error(`Error adding billing address for user: ${user?.decodedToken?.uid}, Error: ${err.message}`);
            throw err;
        }
    }

    /**
     * Retrieves billing address details for a user.
     * @param {Object} user - The user object containing the user's information.
     * @returns {Promise<Array>} The list of billing addresses for the user.
     */
    async onBillingDetails(user = {}) {
        try {
            const billingDetails = await BillingMongooseModel.find({
                userId: user?.decodedToken?.uid
            });

            logger.info(`Retrieved billing details for user: ${user?.decodedToken?.uid}`);
            return billingDetails;
        } catch (err) {
            logger.error(`Error retrieving billing details for user: ${user?.decodedToken?.uid}, Error: ${err.message}`);
            throw err;
        }
    }

    /**
     * Updates a billing address.
     * @param {String} id - The ID of the billing address to update.
     * @param {Object} request - The updated billing address details.
     * @returns {Promise<Object>} The updated billing address.
     * @throws {NoRecordFoundError} If the billing address is not found.
     */
    async updateBillingAddress(id, request = {}) {
        try {
            const billingSchema = {
                address: { ...request?.address },
                organization: request?.organization,
                locationId: request?.locationId,
                email: request?.email,
                phone: request?.phone,
                taxNumber: request?.taxNumber,
                name: request?.name,
                lat: request?.lat,
                lng: request?.lng
            };

            let storedBillingAddress = await BillingMongooseModel.findOneAndUpdate(
                { id: id },
                { ...billingSchema },
                {
                    returnDocument: "after",
                }
            );

            if (!storedBillingAddress) {
                logger.warn(`No billing address found with ID: ${id}`);
                throw new NoRecordFoundError(`Billing address with ID ${id} not found`);
            }

            storedBillingAddress = storedBillingAddress?.toJSON();
            logger.info(`Billing address updated successfully for ID: ${id}`);

            return {
                id: storedBillingAddress?.id,
                address: { ...storedBillingAddress?.address },
                organization: storedBillingAddress?.organization,
                locationId: storedBillingAddress?.locationId,
                email: storedBillingAddress?.email,
                phone: storedBillingAddress?.phone,
                taxNumber: storedBillingAddress?.taxNumber,
                name: storedBillingAddress?.name,
                lat: storedBillingAddress?.lat,
                lng: storedBillingAddress?.lng
            };
        } catch (err) {
            logger.error(`Error updating billing address with ID: ${id}, Error: ${err.message}`);
            throw err;
        }
    }
}

export default BillingService;
