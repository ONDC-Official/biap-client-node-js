import { onOrderConfirm } from "../../../utils/protocolApis/index.js";
import { JUSPAY_PAYMENT_STATUS, PAYMENT_TYPES, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionId, addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderByTransactionId,
    getOrderByTransactionIdAndProvider
} from "../db/dbService.js";

import ContextFactory from "../../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirm.service.js";
import JuspayService from "../../../payment/juspay.service.js";

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

        await addOrUpdateOrderWithTransactionIdAndProvider(
            confirmResponse?.context?.transaction_id,dbResponse.provider.id,
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
        let paymentStatus = {}
        // console.log("message---------------->",orderRequest.message)

        const dbResponse = await getOrderByTransactionIdAndProvider(orderRequest?.context?.transaction_id,orderRequest.message.providers.id);

        console.log("dbResponse---------------->",dbResponse)

        if (dbResponse?.paymentStatus === null) {

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse.bppId,
                bpp_uri: dbResponse.bpp_uri,
                city:requestContext.city,
                state:requestContext.state
            });

            if(order.payment.paymentGatewayEnabled){//remove this check once juspay is enabled
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

                paymentStatus = await juspayService.getOrderStatus(orderRequest?.context?.transaction_id);

            }else{
                paymentStatus = {txn_id:requestContext?.transaction_id}
            }

            const bppConfirmResponse = await bppConfirmService.confirmV2(
                context,
                {...order,jusPayTransactionId:paymentStatus.txn_id},
                dbResponse
            );

            console.log("bppConfirmResponse-------------------->",bppConfirmResponse);

            if (bppConfirmResponse?.message?.ack)
                await this.updateOrder(dbResponse, bppConfirmResponse, order?.payment?.type);

            return bppConfirmResponse;

        } else {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse?.bppId,
                messageId: dbResponse?.messageId,
                city:requestContext.city,
                state:requestContext.state
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

            console.log("processOnConfirmResponse------------------------------>",response)
            console.log("processOnConfirmResponse------------------------------>",response?.message?.order.provider)
            if (response?.message?.order) {
                const dbResponse = await getOrderByTransactionIdAndProvider(
                    response?.context?.transaction_id,response?.message?.order.provider.id
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

                if(orderSchema.fulfillment) {
                    orderSchema.fulfillments = [orderSchema.fulfillment];
                    delete orderSchema.fulfillment;
                }

                console.log("processOnConfirmResponse----------------dbResponse.items-------------->",dbResponse)
                console.log("processOnConfirmResponse----------------dbResponse.orderSchema-------------->",orderSchema)

                if(orderSchema.items && dbResponse.items) {
                    orderSchema.items = dbResponse.items
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
                                        ...fulfillment?.end?.location?.address
                                    }
                                }
                            },
                        }
                    });
                }

                orderSchema.updatedQuote= orderSchema.quote;
                //console.log("orderSchema.fulfillments",orderSchema.fulfillments)

                await addOrUpdateOrderWithTransactionIdAndProvider(
                    response.context.transaction_id,dbResponse.provider.id,
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
                city:requestContext.city,
                state:requestContext.state
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

            let paymentStatus = await juspayService.getOrderStatus(orderRequest?.context?.transaction_id);

            return await bppConfirmService.confirmV1(
                context,
                {...order,jusPayTransactionId:paymentStatus.txn_id}
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
                    return err.response.data;
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
            throw err
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
