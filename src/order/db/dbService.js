import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from './order.js';

/**
* update order
 * @param {String} transactionId 
 * @param {Object} orderSchema 
 */
const addOrUpdateOrderWithTransactionId = async (transactionId, orderSchema = {}) => {


    // console.log("items------------------->",transactionId,orderSchema.items)
    return await OrderMongooseModel.findOneAndUpdate(
        {
            transactionId: transactionId
        },
        {
            ...orderSchema
        },
        { upsert: true }
    );

};

const addOrUpdateOrderWithTransactionIdAndBppId = async (transactionId,bppId, orderSchema = {}) => {


    // console.log("items------------------->",transactionId,orderSchema.items)
    return await OrderMongooseModel.findOneAndUpdate(
        {
            transactionId: transactionId,
            bppId:bppId
        },
        {
            ...orderSchema
        },
        { upsert: true }
    );

};

/**
 * get the order with passed transaction id from the database
 * @param {String} transactionId 
 * @returns 
 */
const getOrderByTransactionId = async (transactionId) => {
    const order = await OrderMongooseModel.find({
        transactionId: transactionId
    });

    if (!(order || order.length))
        throw new NoRecordFoundError();
    else
        return order?.[0];
};
const getOrderByTransactionIdAndBppId = async (transactionId,bppId) => {
    const order = await OrderMongooseModel.find({
        transactionId: transactionId,
        bppId:bppId
    });

    if (!(order || order.length))
        throw new NoRecordFoundError();
    else
        return order?.[0];
};

const getOrderById = async (orderId) => {
    const order = await OrderMongooseModel.find({
        id: orderId
    });

    if (!(order || order.length))
        throw new NoRecordFoundError();
    else
        return order?.[0];
};

export { addOrUpdateOrderWithTransactionId,getOrderByTransactionIdAndBppId, getOrderByTransactionId,getOrderById,addOrUpdateOrderWithTransactionIdAndBppId };