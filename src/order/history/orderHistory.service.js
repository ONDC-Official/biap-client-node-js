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
    async findOrders(user, params = {}) {
        try {
            const { orderId, parentOrderId, transactionId, skip = 0, limit = 10} = params;  

            let orders = [];

            if (orderId) {
                orders = await OrderMongooseModel.find({ id: orderId }).limit(1).skip(skip);
            } else if (parentOrderId) {
                orders = await OrderMongooseModel.find({ parentOrderId: parentOrderId }).limit(limit).skip(skip);
            } else if (transactionId) {
                orders = await OrderMongooseModel.find({ transactionId: transactionId }).limit(1).skip(skip);
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
    async getOrdersList(user, params = {}) {
        try {
            return await this.findOrders(user, params);
        }
        catch (err) {
            throw err;
        }
    }
}

export default OrderHistoryService;
