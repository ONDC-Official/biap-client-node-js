import NoRecordFoundError from "../../../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from './order.js';
import OrderRequestLogMongooseModel from "./orderRequestLog.js";
import OrderHistory from "../../v2/db/orderHistory.js";
import FulfillmentHistory from "../../v2/db/fulfillmentHistory.js";

/**
 * Update order with a given transaction ID.
 * @param {String} transactionId - The transaction ID for the order.
 * @param {Object} orderSchema - The order details to update or insert.
 * @returns {Promise<Object>} - The updated or created order document.
 */
const addOrUpdateOrderWithTransactionId = async (transactionId, orderSchema = {}) => {
    return await OrderMongooseModel.findOneAndUpdate(
        { transactionId: transactionId },
        { ...orderSchema },
        { upsert: true }
    );
};

/**
 * Update order with a given transaction ID and provider ID.
 * @param {String} transactionId - The transaction ID for the order.
 * @param {String} providerId - The provider ID associated with the order.
 * @param {Object} orderSchema - The order details to update or insert.
 * @returns {Promise<Object>} - The updated or created order document.
 */
const addOrUpdateOrderWithTransactionIdAndProvider = async (transactionId, providerId, orderSchema = {}) => {
    return await OrderMongooseModel.findOneAndUpdate(
        { transactionId: transactionId, "provider.id": providerId },
        { ...orderSchema },
        { upsert: true }
    );
};

/**
 * Update order with a given transaction ID and order ID.
 * @param {String} transactionId - The transaction ID for the order.
 * @param {String} orderId - The order ID associated with the order.
 * @param {Object} orderSchema - The order details to update or insert.
 * @returns {Promise<Object>} - The updated or created order document.
 */
const addOrUpdateOrderWithTransactionIdAndOrderId = async (transactionId, orderId, orderSchema = {}) => {
    return await OrderMongooseModel.findOneAndUpdate(
        { transactionId: transactionId, "id": orderId },
        { ...orderSchema },
        { upsert: true }
    );
};

/**
 * Update order with a given order ID.
 * @param {String} orderId - The order ID associated with the order.
 * @param {Object} orderSchema - The order details to update or insert.
 * @returns {Promise<Object>} - The updated or created order document.
 */
const addOrUpdateOrderWithdOrderId = async (orderId, orderSchema = {}) => {
    return await OrderMongooseModel.findOneAndUpdate(
        { "id": orderId },
        { ...orderSchema },
        { upsert: true }
    );
};

/**
 * Get the order by the given transaction ID from the database.
 * @param {String} transactionId - The transaction ID to search for.
 * @returns {Promise<Object>} - The order document.
 * @throws {NoRecordFoundError} - Throws an error if no order is found.
 */
const getOrderByTransactionId = async (transactionId) => {
    const order = await OrderMongooseModel.find({ transactionId: transactionId });

    if (!(order || order.length)) {
        throw new NoRecordFoundError();
    } else {
        return order?.[0];
    }
};

/**
 * Get the order by the given transaction ID and provider ID from the database.
 * @param {String} transactionId - The transaction ID to search for.
 * @param {String} providerId - The provider ID to search for.
 * @returns {Promise<Object>} - The order document.
 * @throws {NoRecordFoundError} - Throws an error if no order is found.
 */
const getOrderByTransactionIdAndProvider = async (transactionId, providerId) => {
    const order = await OrderMongooseModel.find({
        transactionId: transactionId,
        "provider.id": providerId
    });

    if (!(order || order.length)) {
        throw new NoRecordFoundError();
    } else {
        return order?.[0];
    }
};

/**
 * Get the order by order ID from the database.
 * @param {String} orderId - The order ID to search for.
 * @returns {Promise<Object>} - The order document with order and fulfillment history.
 * @throws {NoRecordFoundError} - Throws an error if no order is found.
 */
const getOrderById = async (orderId) => {
    let order = await OrderMongooseModel.find({ id: orderId }).lean();

    if (!(order || order.length)) {
        throw new NoRecordFoundError();
    } else {
        let orderHistory = await OrderHistory.find({ orderId: orderId });
        let fulfillmentHistory = await FulfillmentHistory.find({ orderId: orderId });
        order[0].orderHistory = orderHistory;
        order[0].fulfillmentHistory = fulfillmentHistory;
        return order;
    }
};

/**
 * Save the order request in the logs.
 * @param {Object} data - The request data to log.
 * @returns {Promise<Object>} - The saved order request log.
 */
const saveOrderRequest = async (data) => {
    const transactionId = data.context.transaction_id;
    const messageId = data.context.message_id;
    const request = data.data;
    const requestType = data.context.action;
    const order = new OrderRequestLogMongooseModel({ requestType, transactionId, messageId, request });

    await order.save();
    return order;
};

/**
 * Get a specific order request from the logs.
 * @param {Object} data - The data containing transaction ID and message ID.
 * @returns {Promise<Object>} - The order request log.
 */
const getOrderRequest = async (data) => {
    const transactionId = data.transaction_id;
    const messageId = data.message_id;
    const requestType = data.requestType;
    const order = await OrderRequestLogMongooseModel.findOne({ transactionId, messageId, requestType });
    return order;
};

/**
 * Get the latest order request from the logs.
 * @param {Object} data - The data containing transaction ID and request type.
 * @returns {Promise<Object>} - The latest order request log.
 */
const getOrderRequestLatestFirst = async (data) => {
    const transactionId = data.transaction_id;
    const requestType = data.requestType;
    const order = await OrderRequestLogMongooseModel.findOne({ transactionId, requestType }).sort({ "createdAt": -1 });
    return order;
};

// Exporting functions for external usage
export {
    getOrderRequest,
    addOrUpdateOrderWithdOrderId,
    getOrderRequestLatestFirst,
    saveOrderRequest,
    addOrUpdateOrderWithTransactionIdAndOrderId,
    addOrUpdateOrderWithTransactionId,
    getOrderByTransactionIdAndProvider,
    getOrderByTransactionId,
    getOrderById,
    addOrUpdateOrderWithTransactionIdAndProvider
};
