import { v4 as uuidv4 } from 'uuid';

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
            };

            let storedBillingAddress = await BillingMongooseModel.create({ ...billingSchema });
            storedBillingAddress = storedBillingAddress.toJSON();

            return {
                address: {
                    ...storedBillingAddress?.address,
                },
                organization: storedBillingAddress?.organization,
                locationId: storedBillingAddress?.locationId,
                email: storedBillingAddress?.email,
                phone: storedBillingAddress?.phone,
                taxNumber: storedBillingAddress?.taxNumber,
                name: storedBillingAddress?.name,
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
    async onBillingDetails(user) {
        try {
            const billingDetails = await BillingMongooseModel.find({
                userId: user.decodedToken.uid
            });
            return billingDetails;
        }
        catch (err) {
            throw err;
        }
    }
}

export default BillingService;
