import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderConfirm } from "../../utils/protocolApis/index.js";
import { JUSPAY_PAYMENT_STATUS, PAYMENT_TYPES, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../../utils/constants.js";
import { addOrUpdateOrderWithTransactionId, getOrderByTransactionId } from "../db/dbService.js";
import { getSubscriberType, getSubscriberUrl } from "../../utils/registryApis/registryUtil.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirm.service.js";
import JuspayService from "../../payment/juspay.service.js";
import { getBAPOrderId } from './../util/order.js';

const bppConfirmService = new BppConfirmService();
const juspayService = new JuspayService();

class ConfirmOrderService {

    /**
     * 
     * @param {Array} items 
     * @returns Boolean
     */
    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    /**
     * 
     * @param {Array} items 
     * @returns Boolean
     */
    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    /**
     * 
     * @param {Object} payment
     * @param {String} orderId
     * @param {Boolean} confirmPayment
     * @returns Boolean
     */
    async arePaymentsPending(payment, orderId, total, confirmPayment = true) {
        if (payment?.type !== PAYMENT_TYPES["ON-ORDER"])
            return false;

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
     * Update order in db
     * @param {Object} dbResponse 
     * @param {Object} confirmResponse 
     */
    async updateOrder(dbResponse, confirmResponse, paymentType) {
        let orderSchema = dbResponse?.toJSON() || {};

        orderSchema.messageId = confirmResponse?.context?.message_id;
        if (paymentType === PAYMENT_TYPES["ON-ORDER"])
            orderSchema.paymentStatus = PROTOCOL_PAYMENT.PAID;

        await addOrUpdateOrderWithTransactionId(
            getBAPOrderId(confirmResponse?.context?.transaction_id, orderSchema?.provider?.id),
            { ...orderSchema }
        );
    }

    /**
     * confirm and update order in db
     * @param {Object} orderRequest 
     * @param {Number} total
     * @param {Boolean} confirmPayment
     */
    async confirmAndUpdateOrder(orderRequest = {}, total, confirmPayment = true) {
        const {
            context: requestContext,
            message: order = {}
        } = orderRequest || {};

        const dbResponse = await getOrderByTransactionId(getBAPOrderId(
            orderRequest?.context?.transaction_id,
            "1"
        ));

        console.log("dbResponse", dbResponse);

        if (dbResponse?.paymentStatus === null) {

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse.bppId
            });

            if (await this.arePaymentsPending(
                order?.payment,
                orderRequest?.context?.parent_order_id,
                total,
                confirmPayment,
            )) {
                return {
                    context,
                    error: {
                        message: "BAP hasn't received payment yet",
                        status: "BAP_015",
                        name: "PAYMENT_PENDING"
                    }
                };
            }

            const subscriberDetails = await lookupBppById({
                type: getSubscriberType(SUBSCRIBER_TYPE.BPP),
                subscriber_id: context?.bpp_id
            });

            const bppConfirmResponse = await bppConfirmService.confirmV2(
                context,
                getSubscriberUrl(subscriberDetails),
                order,
                dbResponse
            );

            if (bppConfirmResponse?.message?.ack)
                await this.updateOrder(dbResponse, bppConfirmResponse, order?.payment?.type);

            return bppConfirmResponse;

        } else {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse?.bppId,
                messageId: dbResponse?.messageId
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
     * process on confirm response and update db
     * @param {Object} response 
     * @returns 
     */
    async processOnConfirmResponse(response = {}) {
        try {
            if (response?.message?.order) {
                const dbResponse = await getOrderByTransactionId(
                    getBAPOrderId(
                        response?.context?.transaction_id, 
                        response?.message?.order?.provider?.id
                ));

                console.log("dbResponse 2-----------",dbResponse);
                let orderSchema = { ...response?.message?.order };

                orderSchema.messageId = response?.context?.message_id;
                orderSchema.billing = {
                    ...orderSchema.billing,
                    address: {
                        ...orderSchema.billing.address,
                        areaCode: orderSchema.billing.address.area_code
                    }
                };

                if(orderSchema.fulfillment) {
                    orderSchema.fulfillments = [orderSchema.fulfillment];
                    delete orderSchema.fulfillment;
                }   

                if(orderSchema.fulfillment) {
                    orderSchema.fulfillments = [...orderSchema.fulfillments].map((fulfillment) => {
                        return {
                            ...fulfillment,
                            end: {
                                ...fulfillment?.end,
                                location: {
                                    ...fulfillment?.end?.location,
                                    address: {
                                        ...fulfillment?.end?.location?.address,
                                        areaCode: fulfillment?.end?.location?.address?.area_code
                                    }
                                }
                            },
                        }
                    });
                }

                await addOrUpdateOrderWithTransactionId(
                    getBAPOrderId(response?.context?.transaction_id, response?.message?.order?.provider?.id),
                    { ...orderSchema }
                );

                response.parentOrderId = dbResponse?.[0]?.parentOrderId;
            }

            return response;
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * confirm order
    * @param {Object} orderRequest
    */
    async confirmOrder(orderRequest) {
        try {
            const { context: requestContext, message: order = {} } = orderRequest || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
            });

            if (!(order?.items?.length)) {
                return {
                    context,
                    error: { message: "Empty order received" }
                };
            }
            else if (this.areMultipleBppItemsSelected(order?.items)) {
                return {
                    context,
                    error: { message: "More than one BPP's item(s) selected/initialized" }
                };
            }
            else if (this.areMultipleProviderItemsSelected(order?.items)) {
                return {
                    context,
                    error: { message: "More than one Provider's item(s) selected/initialized" }
                };
            } else if (await this.arePaymentsPending(
                order?.payment,
                orderRequest?.context?.transaction_id,
                order?.payment?.paid_amount
            )) {
                return {
                    context,
                    error: {
                        message: "BAP hasn't received payment yet",
                        status: "BAP_015",
                        name: "PAYMENT_PENDING"
                    }
                };
            }

            const subscriberDetails = await lookupBppById({
                type: getSubscriberType(SUBSCRIBER_TYPE.BPP),
                subscriber_id: order?.items[0]?.bpp_id
            });

            return await bppConfirmService.confirmV1(
                context,
                getSubscriberUrl(subscriberDetails),
                order
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * confirm multiple orders
     * @param {Array} orders 
     */
    async confirmMultipleOrder(orders) {

        let total = 0;
        orders.forEach(order => {
            total += order?.message?.payment?.paid_amount;
        });

        const confirmOrderResponse = await Promise.all(
            orders.map(async orderRequest => {
                try {
                    return await this.confirmAndUpdateOrder(orderRequest, total, true);
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return confirmOrderResponse;
    }

    /**
    * on confirm order
    * @param {Object} messageId
    */
    async onConfirmOrder(messageId) {
        try {
            let protocolConfirmResponse = await onOrderConfirm(messageId);
            protocolConfirmResponse = protocolConfirmResponse?.[0] || {};

            if (
                protocolConfirmResponse?.context &&
                protocolConfirmResponse?.message?.order &&
                protocolConfirmResponse.context.message_id &&
                protocolConfirmResponse.context.transaction_id
            ) {
                return protocolConfirmResponse;

            } else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_CONFIRM
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }

        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on confirm multiple order
    * @param {Object} messageId
    */
    async onConfirmMultipleOrder(messageIds) {
        try {
            const onConfirmOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const protocolConfirmResponse = await this.onConfirmOrder(messageId);
                        return await this.processOnConfirmResponse(protocolConfirmResponse);
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onConfirmOrderResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default ConfirmOrderService;
