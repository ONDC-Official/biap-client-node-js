import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from './order.js';

/**
* update order
 * @param {String} transactionId 
 * @param {Object} orderSchema 
 */
const addOrUpdateOrderWithTransactionId = async (bapOrderId, orderSchema = {}) => {

    return await OrderMongooseModel.findOneAndUpdate(
        {
            bapOrderId: bapOrderId
        },
        {
            ...orderSchema
        },
        { upsert: true }
    );

};

/**
 * get the order with passed transaction id from the database
 * @param {String} bapOrderId 
 * @returns 
 */
const getOrderByTransactionId = async (bapOrderId) => {
    const order = await OrderMongooseModel.find({
        bapOrderId: bapOrderId
    });

    if (!(order || order.length))
        throw new NoRecordFoundError();
    else
        return order?.[0];
};

export { addOrUpdateOrderWithTransactionId, getOrderByTransactionId };