import { PROTOCOL_CONTEXT } from '../../utils/constants.js';
import { sendSSEResponse } from '../../utils/sse.js';
import OrderStatusService from "../../module/order/v2/status/orderStatusService.js";
import UpdateOrderService from "../../module/order/v2/update/updateOrderService.js";
import CancelOrderService from "../../module/order/v2/cancel/cancelOrderService.js";
import logger from '../../lib/logger/index.js'; // Assuming you have a logger utility

const orderStatusService = new OrderStatusService();
const updateOrderService = new UpdateOrderService();
const cancelOrderService = new CancelOrderService();

class SseProtocol {

    /**
     * Handles the cancel operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onCancel(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling cancel operation for messageId: ${messageId}`); // Log the cancel operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_CANCEL, response);

            await cancelOrderService.onCancelOrderDbOperation(messageId);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onCancel: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the confirm operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onConfirm(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling confirm operation for messageId: ${messageId}`); // Log the confirm operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_CONFIRM, response);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onConfirm: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the init operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onInit(response) {
        try {
            const { messageId } = response;

            logger.info(`[DEBUG] onInit for messageId: ${messageId}, response: ${JSON.stringify(response)}`); // Log init operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_INIT, response);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onInit: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the search operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onSearch(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling search operation for messageId: ${messageId}`); // Log the search operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_SEARCH, response);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onSearch: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the quote operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onQuote(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling quote operation for messageId: ${messageId}`); // Log the quote operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_SELECT, response);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onQuote: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the status operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onStatus(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling status operation for messageId: ${messageId}`); // Log the status operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_STATUS, response);

            await orderStatusService.onOrderStatusV2([messageId]);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onStatus: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the support operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onSupport(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling support operation for messageId: ${messageId}`); // Log the support operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_SUPPORT, response);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onSupport: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the track operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onTrack(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling track operation for messageId: ${messageId}`); // Log the track operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_TRACK, response);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onTrack: ${err.message}`); // Log the error
            throw err;
        }
    }

    /**
     * Handles the update operation.
     * @param {Object} response - The response object containing messageId and other data.
     * @returns {Object} - An acknowledgment message.
     */
    async onUpdate(response) {
        try {
            const { messageId } = response;

            logger.info(`Handling update operation for messageId: ${messageId}`); // Log the update operation
            sendSSEResponse(messageId, PROTOCOL_CONTEXT.ON_UPDATE, response);

            await updateOrderService.onUpdateDbOperation(messageId);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        } catch (err) {
            logger.error(`Error in onUpdate: ${err.message}`); // Log the error
            throw err;
        }
    }
}

export default SseProtocol;
