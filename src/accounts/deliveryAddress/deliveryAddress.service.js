import { v4 as uuidv4 } from 'uuid';

import DeliveryAddressMongooseModel from './db/deliveryAddress.js';

class DeliveryAddressService {

    /**
    * add delivery address
    * @param {Object} request
    * @param {Object} user
    */
    async deliveryAddress(request, user) {
        try {
            const deliveryAddressSchema = {
                userId: user.decodedToken.uid,
                id: uuidv4(),
                descriptor: request.descriptor,
                gps: request.gps,
                defaultAddress: true,
                address: request.address,
            };
                        
            await DeliveryAddressMongooseModel.updateMany(
                { userId: user.decodedToken.uid },
                { defaultAddress: false}
            );

            let storedDeliveryAddress = await DeliveryAddressMongooseModel.create(
                { ...deliveryAddressSchema}
            );
            storedDeliveryAddress = storedDeliveryAddress.toJSON();

            return {
                id: storedDeliveryAddress?.id,
                descriptor: storedDeliveryAddress?.descriptor,
                gps: storedDeliveryAddress?.gps,
                defaultAddress: storedDeliveryAddress?.defaultAddress,
                address: storedDeliveryAddress?.address
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * get delivery address
     * @param {Object} user
     */
    async onDeliveryAddressDetails(user) {
        try {
            const deliveryAddressDetails = await DeliveryAddressMongooseModel.find({ 
                userId: user.decodedToken.uid
            });
            
            return deliveryAddressDetails;
        }
        catch (err) {
            throw err;
        }
    }

}

export default DeliveryAddressService;
