import { v4 as uuidv4 } from 'uuid';
import NoRecordFoundError from '../../lib/errors/no-record-found.error.js';

import DeliveryAddressMongooseModel from './db/deliveryAddress.js';

class DeliveryAddressService {

    /**
    * add delivery address
    * @param {Object} request
    * @param {Object} user
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
                { defaultAddress: false}
            );

            let storedDeliveryAddress = await DeliveryAddressMongooseModel.create(
                { ...deliveryAddressSchema}
            );
            storedDeliveryAddress = storedDeliveryAddress?.toJSON();

            return {
                id: storedDeliveryAddress?.id,
                descriptor: storedDeliveryAddress?.descriptor,
                gps: storedDeliveryAddress?.gps,
                defaultAddress: storedDeliveryAddress?.defaultAddress,
                address: storedDeliveryAddress?.address,
                lat: storedDeliveryAddress?.lat,
                lng: storedDeliveryAddress?.lng
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
    async onDeliveryAddressDetails(user = {}) {
        try {
            const deliveryAddressDetails = await DeliveryAddressMongooseModel.find({ 
                userId: user?.decodedToken?.uid
            });
            
            return deliveryAddressDetails;
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * add delivery address
    * @param {String} id
    * @param {Object} request
    * @param {String} userId
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

            if(request?.defaultAddress)
                await DeliveryAddressMongooseModel.updateMany(
                    { userId: userId },
                    { defaultAddress: false}
                );

            let storedDeliveryAddress = await DeliveryAddressMongooseModel.findOneAndUpdate(
                { id: id },
                { ...deliveryAddressSchema},
                {
                    returnDocument: "after",
                }
            );
            storedDeliveryAddress = storedDeliveryAddress?.toJSON();

            if(storedDeliveryAddress)
                return {
                    id: storedDeliveryAddress?.id,
                    descriptor: storedDeliveryAddress?.descriptor,
                    gps: storedDeliveryAddress?.gps,
                    defaultAddress: storedDeliveryAddress?.defaultAddress,
                    address: storedDeliveryAddress?.address,
                    lat: storedDeliveryAddress?.lat,
                    lng: storedDeliveryAddress?.lng
                };
            else
                throw new NoRecordFoundError(`Delivery address with ${id} not found`);
        }
        catch (err) {
            throw err;
        }
    }

}

export default DeliveryAddressService;
