import { lookupBppById } from "../../utils/registryApis/index.js";
import { getRandomString } from '../../utils/stringHelper.js';
import { onOrderConfirm } from "../../utils/protocolApis/index.js";
import { JUSPAY_PAYMENT_STATUS, PAYMENT_TYPES, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../../utils/constants.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirm.service.js";
import JuspayService from "../../payment/juspay.service.js";
import CustomError from "../../lib/errors/custom.error.js";
import OrderMongooseModel from '../db/order.js';

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
     * @returns Boolean
     */
    async arePaymentsPending(payment, orderId) {
        const paymentDetails = await juspayService.getOrderStatus(orderId);

        return payment?.type === PAYMENT_TYPES["ON-ORDER"] && (payment == null ||
            payment.status != PROTOCOL_PAYMENT.PAID ||
            payment.paid_amount <= 0 ||
            payment.paid_amount !== paymentDetails.amount ||
            paymentDetails.status !== JUSPAY_PAYMENT_STATUS.CHARGED.status);
    }

    /**
    * confirm order
    * @param {Object} orderRequest
    */
    async confirmOrder(orderRequest) {
        try {
            const contextFactory = new ContextFactory();
            let context = contextFactory.create({ action: PROTOCOL_CONTEXT.CONFIRM, transactionId: orderRequest?.context?.transaction_id });

            const { message: order = {} } = orderRequest || {};

            if (!(order?.items?.length)) {
                return { error: { message: "Empty order received" }, context };
            }
            else if (this.areMultipleBppItemsSelected(order?.items)) {
                return { error: { message: "More than one BPP's item(s) selected/initialized" }, context };
            }
            else if (this.areMultipleProviderItemsSelected(order?.items)) {
                return { error: { message: "More than one Provider's item(s) selected/initialized" }, context };
            }
            else if (await this.arePaymentsPending(order?.payment, orderRequest?.context?.transaction_id)) {
                return { error: { message: "BAP hasn't received payment yet", status: "BAP_015", name: "PAYMENT_PENDING" }, context };
            }

            const subscriberDetails = await lookupBppById({ type: SUBSCRIBER_TYPE.BPP, subscriber_id: order?.items[0]?.bpp_id });
            context.bpp_id = order?.items[0]?.bpp_id;
            
            return await bppConfirmService.confirm(context, subscriberDetails?.[0]?.subscriber_url, order);

        }
        catch (err) {
            throw err;
        }
    }

    /**
     * confirm multiple orders
     * @param {Array} orders 
     */
    async confirmMultipleOrder(orders, user) {

        const parentOrderId = getRandomString();

        const confirmOrderResponse = await Promise.all(
            orders.map(async order => {
                try {
                    const orderResponse = await this.confirmOrder(order);
                    if(!orderResponse.error) {
                        await OrderMongooseModel.findOneAndUpdate(
                            {
                                messageId: orderResponse.context.message_id
                            },
                            {
                                userId: user?.decodedToken?.uid,
                                messageId: orderResponse.context.message_id,
                                transactionId: null,
                                parentOrderId: parentOrderId,
                                bppId: orderResponse.context.bpp_id
                            },
                            { upsert: true }
                        );
                    }

                    return orderResponse;
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
            let orderStatus = await onOrderConfirm(messageId);

            if (!(orderStatus && orderStatus.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({ messageId: messageId });

                return [{
                    context,
                    error: {
                        message: "No data found"
                    }
                }];
            }
            else {
                return orderStatus;
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
    async onConfirmMultipleOrder(messageIds, user) {
        try {

            const onConfirmOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onConfirm = await this.onConfirmOrder(messageId);
                        let resultResponse = onConfirm?.[0];

                        if (resultResponse?.message?.order) {

                            if (!resultResponse.context.message_id) {
                                throw new CustomError("No message with the given ID", "404", "NOT_FOUND");
                            }

                            let orderData = await OrderMongooseModel.find({
                                messageId: resultResponse.context.message_id
                            });

                            if (!(orderData || orderData.length)) {
                                throw new CustomError("No message with the given ID", "404", "NOT_FOUND");
                            }
                            else {
                                let orderSchema = { ...resultResponse.message.order };
                                
                                orderSchema.transactionId = resultResponse?.context?.transaction_id;
                                orderSchema.userId = user?.decodedToken?.uid;
                                orderSchema.messageId = resultResponse.context?.message_id;
                                orderSchema.parentOrderId = orderData[0].parentOrderId;
                                orderSchema.bppId = resultResponse.context?.bpp_id;

                                await OrderMongooseModel.findOneAndUpdate(
                                    {
                                        messageId: resultResponse.context.message_id
                                    },
                                    {
                                        ...orderSchema
                                    },
                                    { upsert: true }
                                );
                            }
                            resultResponse.parentOrderId = orderData?.[0].parentOrderId;
                        }


                        return { ...resultResponse };
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
