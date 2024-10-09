import { v4 as uuidv4 } from 'uuid';
import NoRecordFoundError from '../../../lib/errors/no-record-found.error.js';
import admin from 'firebase-admin';
import DeliveryAddressMongooseModel from './db/deliveryAddress.js';
import axios from 'axios';
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

            this.syncUserWithOMS(user?.decodedToken?.uid,request?.address,false);

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

            this.syncUserWithOMS(userId,request?.address,false);

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

    async syncUserWithOMS(userId, deliveryAddress, update=false){

        let userJSON =  await admin.auth().getUser(userId);
        userJSON = userJSON.toJSON()

        const syncjson = {
           user:{
             email: userJSON.email,
            displayName: userJSON.displayName,
            phoneNumber:  userJSON.phoneNumber,
            uid: userJSON.uid
           },
           address:{
            userId: userId,
            refId: deliveryAddress.id,
                door: deliveryAddress.door,
                building: deliveryAddress.building,
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                state : deliveryAddress.state,
                country: deliveryAddress.country,
                areaCode: deliveryAddress.areaCode,
                tag:  deliveryAddress.tag,
                lat: deliveryAddress.lat,
                lng: deliveryAddress.lng
           },
           update:update
        }

        console.log(syncjson)
        //

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.OMS_URL}/api/ondcUsers`,
            headers: {
                'Content-Type': 'application/json'
            },
            data : syncjson
        };

        // console.log({order})
        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });

        return syncjson;
    }

}

export default DeliveryAddressService;
