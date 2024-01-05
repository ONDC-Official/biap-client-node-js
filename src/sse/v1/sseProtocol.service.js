import { PROTOCOL_CONTEXT } from '../../utils/constants.js';
import { sendSSEResponse } from '../../utils/sse.js';

import OrderStatusService from "../../order/v1/status/orderStatus.service.js";
import UpdateOrderService from "../../order/v1/update/updateOrder.service.js";
import CancelOrderService from "../../order/v1/cancel/cancelOrder.service.js";
const orderStatusService = new OrderStatusService();
const updateOrderService = new UpdateOrderService();
const cancelOrderService = new CancelOrderService();

class SseProtocol {

    /**
    * on cancel
    * @param {Object} response 
    */
    async onCancel(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_CANCEL,
                response,
            );

            await cancelOrderService.onCancelOrderDbOperation(messageId);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * on confirm
     * @param {Object} response 
     */
    async onConfirm(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_CONFIRM,
                response,
            );

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on init
    * @param {Object} response 
    */
    async onInit(response) {
        try {
            const { messageId } = response;


            console.log(`[DEBUG] onInit---${messageId}--${response}`)
            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_INIT,
                response,
            );

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on search
    * @param {Object} response 
    */
    async onSearch(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_SEARCH,
                response,
            );

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on quote
    * @param {Object} response 
    */
    async onQuote(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_SELECT,
                response,
            );

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on status
    * @param {Object} response 
    */
    async onStatus(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_STATUS,
                response,
            );

            await orderStatusService.onOrderStatusV2([messageId]);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on support
    * @param {Object} response 
    */
    async onSupport(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_SUPPORT,
                response,
            );

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on track
    * @param {Object} response 
    */
    async onTrack(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_TRACK,
                response,
            );

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on update
    * @param {Object} response
    */
    async onUpdate(response) {
        try {
            const { messageId } = response;

            sendSSEResponse(
                messageId,
                PROTOCOL_CONTEXT.ON_UPDATE,
                response,
            );

            await updateOrderService.onUpdateDbOperation(messageId);

            return {
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
        catch (err) {
            throw err;
        }
    }
};

export default SseProtocol;