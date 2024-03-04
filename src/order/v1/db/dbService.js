import NoRecordFoundError from "../../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from './order.js';
import OrderRequestLogMongooseModel from "./orderRequestLog.js";
import OrderHistory from "../../v2/db/orderHistory.js";
import FulfillmentHistory from "../../v2/db/fulfillmentHistory.js";

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

const addOrUpdateOrderWithTransactionIdAndProvider = async (transactionId, providerId, orderSchema = {}) => {


    // console.log("items------------------->",transactionId,orderSchema.items)
    return await OrderMongooseModel.findOneAndUpdate(
        {
            transactionId: transactionId,
            "provider.id":providerId
        },
        {
            ...orderSchema
        },
        { upsert: true }
    );

};

const addOrUpdateOrderWithTransactionIdAndOrderId = async (transactionId, orderId, orderSchema = {}) => {


    // console.log("items------------------->",transactionId,orderSchema.items)
    return await OrderMongooseModel.findOneAndUpdate(
        {
            transactionId: transactionId,
            "id":orderId
        },
        {
            ...orderSchema
        },
        { upsert: true }
    );

};
const addOrUpdateOrderWithdOrderId = async ( orderId, orderSchema = {}) => {


    // console.log("items------------------->",transactionId,orderSchema.items)
    return await OrderMongooseModel.findOneAndUpdate(
        {
            "id":orderId
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
const getOrderByTransactionIdAndProvider = async (transactionId, providerId) => {
    const order = await OrderMongooseModel.find({
        transactionId: transactionId,
        "provider.id":providerId
    });

    if (!(order || order.length))
        throw new NoRecordFoundError();
    else
        return order?.[0];
};

const getOrderById = async (orderId) => {
    let order = await OrderMongooseModel.find({
        id: orderId
    }).lean();

    if (!(order || order.length))
        throw new NoRecordFoundError();
    else{
        // order = order.toJSON();
        let orderHistory =await OrderHistory.find({orderId:orderId})
        let fulfillmentHistory =await FulfillmentHistory.find({orderId:orderId})
        order[0].orderHistory = orderHistory
        order[0].fulfillmentHistory = fulfillmentHistory
        console.log({orderHistory,fulfillmentHistory})
        return order;
    }

};

const saveOrderRequest = async (data) => {

    //console.log("data---to save----->",data);
    //console.log("data---to save----->",data.context);

    const transactionId= data.context.transaction_id
    const messageId= data.context.message_id
    const request = data.data
    const requestType = data.context.action
    const order =new OrderRequestLogMongooseModel({requestType,transactionId,messageId,request})

    await order.save();

    return order;
};

const getOrderRequest = async (data) => {
    const transactionId= data.transaction_id
    const messageId= data.message_id
    const requestType= data.requestType
    const order = await OrderRequestLogMongooseModel.findOne({transactionId,messageId,requestType})
    return order;
};

const getOrderRequestLatestFirst = async (data) => {
    const transactionId= data.transaction_id
    const requestType= data.requestType
    const order = await OrderRequestLogMongooseModel.findOne({transactionId,requestType}).sort({"createdAt":-1})
    return order;
};

export {getOrderRequest,addOrUpdateOrderWithdOrderId,getOrderRequestLatestFirst,saveOrderRequest,addOrUpdateOrderWithTransactionIdAndOrderId,addOrUpdateOrderWithTransactionId,getOrderByTransactionIdAndProvider, getOrderByTransactionId,getOrderById,addOrUpdateOrderWithTransactionIdAndProvider };