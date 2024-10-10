import { onOrderCancel } from "../../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionIdAndOrderId,
    getOrderById
} from "../../v1/db/dbService.js";

import BppCancelService from "./bppCancelService.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import CustomError from "../../../../lib/errors/bad-request-parameter.error.js";
import NoRecordFoundError from "../../../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from '../../v1/db/order.js';
import logger from "../../../../lib/logger/index.js"; // Assuming you have a logger utility

const bppCancelService = new BppCancelService();

class CancelOrderService {

    /**
     * Cancels an order based on the provided order request and user information.
     *
     * @param {Object} orderRequest - The order cancellation request containing order details.
     * @param {Object} user - The user initiating the cancellation.
     * @returns {Promise<Object[]>} The response from the cancellation service or an empty array if the user does not own the order.
     * @throws {CustomError} Throws an error if BPP ID is not provided.
     */
    async cancelOrder(orderRequest, user) {
        try {
            logger.info("Cancelling order with request:", orderRequest);

            const orderDetails = await getOrderById(orderRequest.message.order_id);
            if (orderDetails[0].userId !== user.decodedToken.uid) {
                logger.warn(`User ${user.decodedToken.uid} attempted to cancel an order they do not own: ${orderRequest.message.order_id}`);
                return [];
            }

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CANCEL,
                transactionId: orderDetails[0].transactionId,
                bppId: orderRequest?.context?.bpp_id,
                bpp_uri: orderDetails[0].bpp_uri,
                cityCode: orderDetails[0].city,
                city: orderDetails[0].city,
                domain: orderDetails[0].domain
            });

            const fulfillmentId = orderDetails[0].items[0].fulfillment_id;
            const { message = {} } = orderRequest || {};
            const { order_id, cancellation_reason_id } = message || {};

            if (!(context?.bpp_id)) {
                logger.error("BPP Id is mandatory");
                throw new CustomError("BPP Id is mandatory");
            }

            const response = await bppCancelService.cancelOrder(
                context,
                order_id,
                cancellation_reason_id,
                fulfillmentId
            );

            logger.info(`Order cancelled successfully for order ID: ${order_id}`);
            return response;
        } catch (err) {
            logger.error("Error cancelling order:", err);
            throw err;
        }
    }

    /**
     * Handles the confirmation of an order cancellation based on the provided message ID.
     *
     * @param {Object} messageId - The ID of the message to confirm cancellation.
     * @returns {Promise<Object>} The response from the cancellation confirmation service.
     */
    async onCancelOrder(messageId) {
        try {
            logger.info(`Processing cancellation confirmation for message ID: ${messageId}`);
            let protocolCancelResponse = await onOrderCancel(messageId);

            if (!(protocolCancelResponse && protocolCancelResponse.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_CANCEL
                });

                logger.warn(`No data found for message ID: ${messageId}`);
                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            } else {
                if (!(protocolCancelResponse?.[0].error)) {
                    protocolCancelResponse = protocolCancelResponse?.[0];
                }
                return protocolCancelResponse;
            }
        } catch (err) {
            logger.error("Error processing cancellation confirmation:", err);
            return err.response.data;
        }
    }

    /**
     * Performs database operations related to order cancellation confirmation based on the provided message ID.
     *
     * @param {Object} messageId - The ID of the message to confirm cancellation.
     * @returns {Promise<Object>} The response from the cancellation confirmation service.
     * @throws {NoRecordFoundError} Throws an error if no records are found in the database.
     */
    async onCancelOrderDbOperation(messageId) {
        try {
            logger.info(`Processing DB operation for cancellation confirmation for message ID: ${messageId}`);
            let protocolCancelResponse = await onOrderCancel(messageId);

            if (!(protocolCancelResponse && protocolCancelResponse.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_CANCEL
                });

                logger.warn(`No data found for message ID: ${messageId}`);
                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            } else {
                if (!(protocolCancelResponse?.[0].error)) {
                    protocolCancelResponse = protocolCancelResponse?.[0];
                    logger.info("Protocol cancel response received:", protocolCancelResponse);

                    const dbResponse = await OrderMongooseModel.find({
                        transactionId: protocolCancelResponse.context.transaction_id,
                        id: protocolCancelResponse.message.order.id
                    });

                    logger.info("Database response for order ID:", dbResponse);

                    if (!(dbResponse || dbResponse.length)) {
                        logger.error("No records found for the given transaction ID and order ID");
                        throw new NoRecordFoundError();
                    } else {
                        const orderSchema = dbResponse?.[0].toJSON();
                        orderSchema.state = protocolCancelResponse?.message?.order?.state;

                        // TODO: refund amount in full cancellation
                        await addOrUpdateOrderWithTransactionIdAndOrderId(
                            protocolCancelResponse.context.transaction_id,
                            protocolCancelResponse.message.order.id,
                            { ...orderSchema }
                        );

                        logger.info(`Order updated successfully in the database for order ID: ${protocolCancelResponse.message.order.id}`);
                    }
                }

                return protocolCancelResponse;
            }
        } catch (err) {
            logger.error("Error during database operation for cancellation confirmation:", err);
            throw err;
        }
    }
}

export default CancelOrderService;
