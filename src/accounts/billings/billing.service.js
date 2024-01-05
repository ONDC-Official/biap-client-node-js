import { v4 as uuidv4 } from 'uuid';
import NoRecordFoundError from '../../lib/errors/no-record-found.error.js';

import BillingMongooseModel from './db/billing.js';

class BillingService {

    /**
    * add billing address
    * @param {Object} request
    * @param {Object} user
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

            return {
                id: storedBillingAddress?.id,
                address: {
                    ...storedBillingAddress?.address,
                },
                organization: storedBillingAddress?.organization,
                locationId: storedBillingAddress?.locationId,
                email: storedBillingAddress?.email,
                phone: storedBillingAddress?.phone,
                taxNumber: storedBillingAddress?.taxNumber,
                name: storedBillingAddress?.name,
                lat: storedBillingAddress?.lat,
                lng: storedBillingAddress?.lng
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * get billing address details
     * @param {Object} user
     */
    async onBillingDetails(user = {}) {
        try {
            const billingDetails = await BillingMongooseModel.find({
                userId: user?.decodedToken?.uid
            });

            return billingDetails;
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * update billing address
    * @param {String} id
    * @param {Object} request
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
            storedBillingAddress = storedBillingAddress?.toJSON();
            
            if(storedBillingAddress)
                return {
                    id: storedBillingAddress?.id,
                    address: {
                        ...storedBillingAddress?.address,
                    },
                    organization: storedBillingAddress?.organization,
                    locationId: storedBillingAddress?.locationId,
                    email: storedBillingAddress?.email,
                    phone: storedBillingAddress?.phone,
                    taxNumber: storedBillingAddress?.taxNumber,
                    name: storedBillingAddress?.name,
                    lat: storedBillingAddress?.lat,
                    lng: storedBillingAddress?.lng
                };
            else
                throw new NoRecordFoundError(`Billing address with ${id} not found`);
        }
        catch (err) {
            throw err;
        }
    }
}

export default BillingService;
