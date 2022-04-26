import OrderMongooseModel from '../db/order.js';

class OrderHistoryService {

    /**
     * 
     * @param {Object} user 
     * @param {String} orderId 
     * @param {String} parentOrderId 
     * @param {Number} skip 
     * @param {Number} limit 
     */
    async findOrders(user, orderId, parentOrderId, skip = 0, limit = 10) {
        try {
            let orders = [];

            if (orderId) {
                orders = await OrderMongooseModel.find({ id: orderId }).limit(1).skip(skip);
            } else if (parentOrderId) {
                orders = await OrderMongooseModel.find({ parentOrderId: parentOrderId }).limit(limit).skip(skip);
            } else {
                orders = await OrderMongooseModel.find({ userId: user.decodedToken.uid }).limit(limit).skip(skip);
            }
            
            return orders;
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * get order list
    * @param {Object} params
    * @param {Object} user
    */
    async getOrdersList(params, user) {
        try {
            const { orderId, parentOrderId, skip = 0, limit = 10} = params;  
            return await this.findOrders(user, orderId, parentOrderId, skip, limit);
        }
        catch (err) {
            throw err;
        }
    }
}

export default OrderHistoryService;
