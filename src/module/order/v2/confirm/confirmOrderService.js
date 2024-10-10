import { onOrderConfirm } from "../../../../utils/protocolApis/index.js";
import {
    JUSPAY_PAYMENT_STATUS,
    PAYMENT_TYPES,
    PROTOCOL_CONTEXT,
    PROTOCOL_PAYMENT
} from "../../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderByTransactionIdAndProvider,
    getOrderById
} from "../../v1/db/dbService.js";

import ContextFactory from "../../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirmService.js";
import JuspayService from "../../../payment/juspayService.js";
import CartService from "../cart/v2/cartService.js";
import FulfillmentHistory from "../db/fulfillmentHistory.js";
import sendAirtelSingleSms from "../../../../utils/sms/smsUtils.js";
import OrderMongooseModel from "../../v1/db/order.js";
import axios from "axios";
import mongoose from 'mongoose';
import logger from "../../../../lib/logger/index.js"; // Import your logger utility

const bppConfirmService = new BppConfirmService();
const cartService = new CartService();
const juspayService = new JuspayService();

class ConfirmOrderService {
    /**
     * Check if multiple BPP items are selected.
     * @param {Array} items - The items to check.
     * @returns {Boolean} - True if multiple BPP items are selected, otherwise false.
     */
    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    /**
     * Check if multiple provider items are selected.
     * @param {Array} items - The items to check.
     * @returns {Boolean} - True if multiple provider items are selected, otherwise false.
     */
    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    /**
     * Check if payments are pending.
     * @param {Object} payment - The payment object to check.
     * @param {String} orderId - The ID of the order.
     * @param {Number} total - The total amount for the order.
     * @param {Boolean} confirmPayment - Flag indicating if payment confirmation should be checked.
     * @returns {Boolean} - True if payments are pending, otherwise false.
     */
    async arePaymentsPending(payment, orderId, total, confirmPayment = true) {
        if (payment?.type !== PAYMENT_TYPES["ON-ORDER"]) return false;

        const paymentDetails = (confirmPayment && await juspayService.getOrderStatus(orderId)) || {};

        return payment == null ||
            payment.paid_amount <= 0 ||
            total <= 0 ||
            (
                confirmPayment &&
                ((process.env.NODE_ENV === "prod" &&
                        total !== paymentDetails?.amount) ||
                    paymentDetails?.status !== JUSPAY_PAYMENT_STATUS.CHARGED.status)
            );
    }

    /**
     * Update order in the database.
     * @param {Object} dbResponse - The response from the database.
     * @param {Object} confirmResponse - The response from the confirmation service.
     * @param {String} paymentType - The type of payment used for the order.
     */
    async updateOrder(dbResponse, confirmResponse, paymentType) {
        let orderSchema = dbResponse?.toJSON() || {};

        orderSchema.messageId = confirmResponse?.context?.message_id;
        if (paymentType === PAYMENT_TYPES["ON-ORDER"]) {
            orderSchema.paymentStatus = PROTOCOL_PAYMENT.PAID;
        }

        await addOrUpdateOrderWithTransactionIdAndProvider(
            confirmResponse?.context?.transaction_id, dbResponse.provider.id,
            { ...orderSchema }
        );
    }

    /**
     * Confirm and update the order in the database.
     * @param {Object} orderRequest - The order request object.
     * @param {Number} total - The total amount for the order.
     * @param {Boolean} confirmPayment - Flag indicating if payment confirmation should be checked.
     * @param {Object} paymentData - Payment-related data.
     * @returns {Object} - The response from the confirmation service.
     */
    async confirmAndUpdateOrder(orderRequest = {}, total, confirmPayment = true, paymentData) {
        const {
            context: requestContext,
            message: order = {}
        } = orderRequest || {};
        let paymentStatus = {};

        logger.info("Confirming order request:", { orderRequest });

        const dbResponse = await getOrderByTransactionIdAndProvider(orderRequest?.context?.transaction_id, orderRequest.message.providers.id);
        logger.info("Database response:", { dbResponse });

        if (dbResponse?.paymentStatus === null) {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse.bppId,
                bpp_uri: dbResponse.bpp_uri,
                city: requestContext.city,
                state: requestContext.state,
                domain: requestContext.domain,
                pincode: requestContext?.pincode,
            });

            paymentStatus = { txn_id: requestContext?.transaction_id };

            const bppConfirmResponse = await bppConfirmService.confirmV2(
                context,
                { ...order, jusPayTransactionId: paymentData.razorpay_order_id },
                dbResponse
            );

            logger.info("BPP confirmation response:", { bppConfirmResponse });

            if (bppConfirmResponse?.message?.ack) {
                await this.updateOrder(dbResponse, bppConfirmResponse, order?.payment?.type);
            }

            return bppConfirmResponse;

        } else {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse?.bppId,
                messageId: dbResponse?.messageId,
                city: requestContext.city,
                state: requestContext.state,
                domain: requestContext.domain
            });

            return {
                context: context,
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
    }

    /**
     * Process the confirm response and update the database.
     * @param {Object} response - The response object from the confirmation.
     * @returns {Object} - The updated response.
     */
    async processOnConfirmResponse(response = {}) {
        try {
            logger.info("Processing confirm response:", { response });

            if (response?.message?.order) {
                const dbResponse = await getOrderByTransactionIdAndProvider(
                    response?.context?.transaction_id, response?.message?.order.provider.id
                );

                let orderSchema = { ...response?.message?.order };
                orderSchema.messageId = response?.context?.message_id;
                orderSchema.city = response?.context?.city;
                orderSchema.billing = {
                    ...orderSchema.billing,
                    address: {
                        ...orderSchema.billing.address,
                        areaCode: orderSchema.billing.address.area_code
                    }
                };

                if (orderSchema.fulfillment) {
                    orderSchema.fulfillments = [orderSchema.fulfillment];
                    delete orderSchema.fulfillment;
                }

                for (let fulfillment of orderSchema.fulfillments) {
                    logger.info("Processing fulfillment:", { fulfillment });
                    let existingFulfillment = await FulfillmentHistory.findOne({
                        id: fulfillment.id,
                        state: fulfillment.state.descriptor.code,
                        orderId: orderSchema.id
                    });
                    if (!existingFulfillment) {
                        await FulfillmentHistory.create({
                            orderId: orderSchema.id,
                            type: fulfillment.type,
                            id: fulfillment.id,
                            state: fulfillment.state.descriptor.code,
                            updatedAt: orderSchema.toString()
                        });
                    }
                }

                logger.info("Updating order schema:", { orderSchema });

                if (orderSchema.items && dbResponse.items) {
                    orderSchema.items = dbResponse.items;
                }

                orderSchema.provider = dbResponse.provider;
                if (orderSchema.fulfillment) {
                    orderSchema.fulfillments = [...orderSchema.fulfillments].map((fulfillment) => {
                        return {
                            ...fulfillment,
                            end: {
                                ...fulfillment?.end,
                                location: {
                                    ...fulfillment?.end?.location,
                                    address: {
                                        ...fulfillment?.end?.location?.address
                                    }
                                }
                            },
                        };
                    });
                }

                let updateItems = [];
                for (let item of dbResponse.items) {
                    let temp = orderSchema?.fulfillments?.find(fulfillment => fulfillment?.id === item?.fulfillment_id);
                    item.fulfillment_status = temp?.state?.descriptor?.code ?? "";
                    updateItems.push(item);
                }
                orderSchema.items = updateItems;
                orderSchema.updatedQuote = orderSchema.quote;
                orderSchema.tags = orderSchema.tags;
                orderSchema.domain = response?.context.domain;

                await addOrUpdateOrderWithTransactionIdAndProvider(
                    response.context.transaction_id, dbResponse.provider.id,
                    { ...orderSchema }
                );

                let billingContactPerson = orderSchema.billing.phone;
                let provider = orderSchema.provider.descriptor.name;
                await sendAirtelSingleSms(billingContactPerson, [provider], 'ORDER_PLACED', false);

                response.parentOrderId = dbResponse?.[0]?.parentOrderId;

                cartService.clearCart({ userId: dbResponse.userId }); // Clear cart once order placed in multicart flows
            }

            return response;
        } catch (err) {
            logger.error("Error processing confirm response:", { error: err.message, response });
            throw err; // Rethrow the error after logging it
        }
    }
}

export default ConfirmOrderService;
