import { onOrderStatus } from "../../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderById,
    getOrderRequest,
    saveOrderRequest
} from "../../v1/db/dbService.js";
import OrderMongooseModel from '../../v1/db/order.js';

import ContextFactory from "../../../factories/ContextFactory.js";
import BppOrderStatusService from "./bppOrderStatusService.js";
import CustomError from "../../../../lib/errors/custom.error.js";
import BppUpdateService from "../update/bppUpdateService.js";
import FulfillmentHistory from "../db/fulfillmentHistory.js";
import OrderHistory from "../db/orderHistory.js";
import sendAirtelSingleSms from "../../../../utils/sms/smsUtils.js";

const bppOrderStatusService = new BppOrderStatusService();
const bppUpdateService = new BppUpdateService();

class OrderStatusService {

    /**
     * Fetches the status of a single order based on the provided order details.
     *
     * @param {Object} order - The order object containing context and message details.
     * @param {Object} order.context - The context of the order.
     * @param {Object} order.message - The message associated with the order, including order_id.
     *
     * @returns {Promise<Object>} - The response from the BPP order status service.
     *
     * @throws {Error} - Throws an error if there is an issue fetching the order status.
     */
    async orderStatus(order) {
        try {
            const { context: requestContext, message } = order || {};

            const orderDetails = await getOrderById(order.message.order_id);
            console.log('domain--------XX------>', orderDetails);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.STATUS,
                transactionId: orderDetails[0]?.transactionId,
                bppId: requestContext?.bpp_id,
                bpp_uri: orderDetails[0]?.bpp_uri,
                cityCode: orderDetails[0].city,
                city: orderDetails[0].city,
                domain: orderDetails[0].domain
            });

            return await bppOrderStatusService.getOrderStatus(context, message);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Fetches the status for multiple orders concurrently.
     *
     * @param {Array<Object>} orders - An array of order objects.
     *
     * @returns {Promise<Array<Object>>} - An array of responses for each order status.
     *
     * @throws {Error} - Throws an error if there is an issue processing the order statuses.
     */
    async orderStatusV2(orders) {
        const orderStatusResponse = await Promise.all(
            orders.map(async order => {
                try {
                    console.log("order------------------>", order);

                    const orderResponse = await this.orderStatus(order);
                    return orderResponse;
                } catch (err) {
                    return err.response.data;
                }
            })
        );

        return orderStatusResponse;
    }

    /**
     * Retrieves the order status based on a message ID from the protocol.
     *
     * @param {String} messageId - The ID of the message to get the order status for.
     *
     * @returns {Promise<Object>} - The response from the protocol order status API.
     *
     * @throws {Error} - Throws an error if there is an issue with the request.
     */
    async onOrderStatus(messageId) {
        try {
            let protocolOrderStatusResponse = await onOrderStatus(messageId);
            console.log("protocolOrderStatusResponse------------>", JSON.stringify(protocolOrderStatusResponse));

            if (protocolOrderStatusResponse && protocolOrderStatusResponse.length) {
                return protocolOrderStatusResponse?.[0];
            } else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({ action: PROTOCOL_CONTEXT.ON_STATUS });
                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Retrieves the order statuses for multiple message IDs concurrently.
     *
     * @param {Array<String>} messageIds - An array of message IDs to retrieve order statuses for.
     *
     * @returns {Promise<Array<Object>>} - An array of responses for each order status.
     *
     * @throws {Error} - Throws an error if there is an issue processing the order statuses.
     */
    async onOrderStatusV2(messageIds) {
        try {
            const onOrderStatusResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onOrderStatusResponse = await this.onOrderStatus(messageId);

                        if (!onOrderStatusResponse.error) {
                            const dbResponse = await OrderMongooseModel.find({
                                transactionId: onOrderStatusResponse?.context?.transaction_id,
                                "provider.id": onOrderStatusResponse.message.order.provider.id
                            });

                            if (dbResponse && dbResponse.length) {
                                const orderSchema = dbResponse?.[0].toJSON();

                                if (orderSchema.state !== onOrderStatusResponse?.message?.order?.state && onOrderStatusResponse?.message?.order?.state === 'Completed') {
                                    let billingContactPerson = orderSchema.billing.phone;
                                    let provider = orderSchema.provider.descriptor.name;
                                    await sendAirtelSingleSms(billingContactPerson, [provider, 'delivered'], 'ORDER_DELIVERED', false);
                                }

                                orderSchema.state = onOrderStatusResponse?.message?.order?.state;
                                orderSchema.fulfillments = onOrderStatusResponse?.message?.order?.fulfillments;

                                if (onOrderStatusResponse?.message?.order?.quote) {
                                    orderSchema.updatedQuote = onOrderStatusResponse?.message?.order?.quote;
                                }
                                if (onOrderStatusResponse?.message?.order?.documents) {
                                    orderSchema.documents = onOrderStatusResponse?.message?.order?.documents;
                                }

                                // Update fulfillment status for each item
                                orderSchema.items = orderSchema.items.map(e => {
                                    let temp = onOrderStatusResponse.message?.order?.fulfillments?.find(fulfillment => fulfillment?.id === e?.fulfillment_id);
                                    e.fulfillment_status = temp ? temp.state?.descriptor?.code ?? "" : "";
                                    return e;
                                });

                                for (let fulfillment of onOrderStatusResponse.message?.order?.fulfillments) {
                                    console.log("fulfillment--->", fulfillment);
                                    let existingFulfillment = await FulfillmentHistory.findOne({
                                        id: fulfillment.id,
                                        state: fulfillment.state.descriptor.code,
                                        orderId: onOrderStatusResponse.message.order.id
                                    });
                                    if (!existingFulfillment) {
                                        await FulfillmentHistory.create({
                                            orderId: onOrderStatusResponse.message.order.id,
                                            type: fulfillment.type,
                                            id: fulfillment.id,
                                            state: fulfillment.state.descriptor.code,
                                            updatedAt: onOrderStatusResponse.message.order.updated_at.toString()
                                        });
                                    }
                                    console.log("existingFulfillment--->", existingFulfillment);
                                }

                                let orderHistory = await OrderHistory.findOne({
                                    orderId: onOrderStatusResponse.message.order.id,
                                    state: onOrderStatusResponse.message.order.state
                                });
                                if (!orderHistory) {
                                    await OrderHistory.create({
                                        orderId: onOrderStatusResponse.message.order.id,
                                        state: onOrderStatusResponse.message.order.state,
                                        updatedAt: onOrderStatusResponse.message.order.updated_at.toString()
                                    });
                                }

                                await addOrUpdateOrderWithTransactionIdAndProvider(
                                    onOrderStatusResponse?.context?.transaction_id,
                                    onOrderStatusResponse.message.order.provider.id,
                                    { ...orderSchema }
                                );

                                return { ...onOrderStatusResponse };
                            } else {
                                const contextFactory = new ContextFactory();
                                const context = contextFactory.create({ action: PROTOCOL_CONTEXT.ON_STATUS });
                                return {
                                    context,
                                    error: {
                                        message: "No data found"
                                    }
                                };
                            }
                        } else {
                            return { ...onOrderStatusResponse };
                        }

                    } catch (err) {
                        throw err;
                    }
                })
            );

            return onOrderStatusResponse;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Updates the payment object for an order based on the provided request and response.
     *
     * @param {Object} orderRequest - The order request object.
     * @param {Object} protocolUpdateResponse - The response from the protocol update service.
     *
     * @returns {Promise<Object>} - The updated order request.
     *
     * @throws {Error} - Throws an error if there is an issue with the update.
     */
    async updateForPaymentObject(orderRequest, protocolUpdateResponse) {
        try {
            console.log("orderRequest.message--->", orderRequest);
            const orderDetails = await getOrderById(orderRequest.message.order.id);
            const orderRequestDb = await getOrderRequest({ transaction_id: orderRequest?.context?.transaction_id, requestType: 'update' });

            if (!orderRequestDb?.request?.data?.payment) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    action: PROTOCOL_CONTEXT.UPDATE,
                    transactionId: orderDetails?.transactionId,
                    bppId: orderRequest.context.bpp_id,
                    bpp_uri: orderDetails?.bpp_uri,
                    cityCode: orderDetails?.city,
                    city: orderDetails?.city,
                    domain: orderDetails?.domain
                });

                const updatedOrderRequest = { ...orderRequest, context, message: { ...orderRequest.message, order: protocolUpdateResponse } };
                console.log("updatedOrderRequest--->", updatedOrderRequest);
                await saveOrderRequest(updatedOrderRequest);

                return updatedOrderRequest;
            } else {
                return orderRequest;
            }
        } catch (err) {
            throw err;
        }
    }
}

export default OrderStatusService;
