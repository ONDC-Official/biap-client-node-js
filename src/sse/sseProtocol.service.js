import { PROTOCOL_CONTEXT } from '../utils/constants.js';
import { SSE_CONNECTIONS } from '../utils/sse.js';

import CancelOrder from "../order/cancel/cancelOrder.service.js";
import ConfirmOrder from "../order/confirm/confirmOrder.service.js";
import InitOrder from "../order/init/initOrder.service.js";
import SearchService from '../discovery/search.service.js';
import QuoteOrder from "../order/quote/quoteOrder.service.js";
import OrderStatus from "../order/status/orderStatus.service.js";
import SupportService from "../support/support.service.js";
import TrackService from "../fulfillment/track.service.js";

const cancelOrder = new CancelOrder();
const confirmOrder = new ConfirmOrder();
const initOrder = new InitOrder();
const searchService = new SearchService();
const quoteOrder = new QuoteOrder();
const orderStatus = new OrderStatus();
const supportService = new SupportService();
const trackService = new TrackService();

class SseProtocol {

    /**
     * 
     * @param {String} action 
     * @param {String} messageId 
     * @returns 
     */
    async getDataFromProtocol(action, messageId) {
        try {
            switch (action) {
                case PROTOCOL_CONTEXT.ON_CANCEL:
                    return await cancelOrder.onCancelOrder(messageId);
                case PROTOCOL_CONTEXT.ON_CONFIRM:
                    return await confirmOrder.onConfirmMultipleOrder([messageId]);
                case PROTOCOL_CONTEXT.ON_INIT:
                    return await initOrder.onInitMultipleOrder([messageId]);
                case PROTOCOL_CONTEXT.ON_SEARCH:
                    return await searchService.onSearch({ messageId: messageId });
                case PROTOCOL_CONTEXT.ON_SELECT:
                    return await quoteOrder.onQuoteOrder(messageId);
                case PROTOCOL_CONTEXT.ON_STATUS:
                    return await orderStatus.onOrderStatus(messageId);
                case PROTOCOL_CONTEXT.ON_SUPPORT:
                    return await supportService.onSupport(messageId);
                case PROTOCOL_CONTEXT.ON_TRACK:
                    return await trackService.onTrack(messageId);

            }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on cancel
    * @param {Object} response 
    * @param {String} messageId
    */
    async onCancel(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_CANCEL,
                messageId
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
     * on confirm
     * @param {Object} response 
     * @param {String} messageId
     */
    async onConfirm(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_CONFIRM,
                messageId
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
    * @param {String} messageId
    */
    async onInit(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_INIT,
                messageId
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
    * @param {String} messageId
    */
    async onSearch(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_SEARCH,
                messageId
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
    * @param {String} messageId
    */
    async onQuote(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_SELECT,
                messageId
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
    * @param {String} messageId
    */
    async onStatus(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_STATUS,
                messageId
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
    * on support
    * @param {Object} response 
    * @param {String} messageId
    */
    async onSupport(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_SUPPORT,
                messageId
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
    * @param {String} messageId
    */
    async onTrack(response, messageId) {
        try {
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                PROTOCOL_CONTEXT.ON_TRACK,
                messageId
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
};

export default SseProtocol;