import { onOrderCancel } from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionId,
    addOrUpdateOrderWithTransactionIdAndProvider,
    addOrUpdateOrderWithTransactionIdAndOrderId,
    getOrderById
} from "../db/dbService.js";

import BppCancelService from "./bppCancel.service.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import CustomError from "../../../lib/errors/custom.error.js";
import NoRecordFoundError from "../../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from '../db/order.js';

const bppCancelService = new BppCancelService();

class CancelOrderService {

    /**
    * cancel order
    * @param {Object} orderRequest
    */
    async cancelOrder(orderRequest) {
        try {


            console.log("cancel order-------------->",orderRequest);

            const orderDetails = await getOrderById(orderRequest.message.order_id);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CANCEL,
                transactionId: orderDetails.transactionId,
                bppId: orderRequest?.context?.bpp_id,
                bpp_uri: orderDetails?.bpp_uri,
                cityCode:orderDetails.city
            });

            const { message = {} } = orderRequest || {};
            const { order_id, cancellation_reason_id } = message || {};

            if (!(context?.bpp_id)) {
                throw new CustomError("BPP Id is mandatory");
            }

            return await bppCancelService.cancelOrder(
                context,
                order_id,
                cancellation_reason_id
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on cancel order
    * @param {Object} messageId
    */
    async onCancelOrder(messageId) {
        try {
            let protocolCancelResponse = await onOrderCancel(messageId);

            if (!(protocolCancelResponse && protocolCancelResponse.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_CANCEL
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
            else {
                if (!(protocolCancelResponse?.[0].error)) {

                    protocolCancelResponse = protocolCancelResponse?.[0];
                }
                return protocolCancelResponse;
            }
        }
        catch (err) {
            return err.response.data;
        }
    }

    async onCancelOrderDbOperation(messageId) {
        try {
            let protocolCancelResponse = await onOrderCancel(messageId);

            if (!(protocolCancelResponse && protocolCancelResponse.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_CANCEL
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
            else {
                if (!(protocolCancelResponse?.[0].error)) {

                    protocolCancelResponse = protocolCancelResponse?.[0];

                    console.log("protocolCancelResponse----------------->",protocolCancelResponse);

                    // message: { order: { id: '7488750', state: 'Cancelled', tags: [Object] } }
                    const dbResponse = await OrderMongooseModel.find({
                        transactionId: protocolCancelResponse.context.transaction_id,id: protocolCancelResponse.message.order.id
                    });

                    console.log("dbResponse----------------->",dbResponse);


                    if (!(dbResponse || dbResponse.length))
                        throw new NoRecordFoundError();
                    else {
                        const orderSchema = dbResponse?.[0].toJSON();
                        orderSchema.state = protocolCancelResponse?.message?.order?.state;

                        await addOrUpdateOrderWithTransactionIdAndOrderId(
                            protocolCancelResponse.context.transaction_id,protocolCancelResponse.message.order.id,
                            { ...orderSchema }
                        );
                    }
                }

                return protocolCancelResponse;
            }

        }
        catch (err) {
            throw err;
        }
    }

}

export default CancelOrderService;
