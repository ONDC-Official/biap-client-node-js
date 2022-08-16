import { PROTOCOL_CONTEXT } from '../utils/constants.js';
import { SSE_CONNECTIONS } from '../utils/sse.js';
class SseProtocol {

    /**
    * on cancel
    * @param {Object} response 
    */
    async onCancel(response) {
        try {
            const { messageId } = response;

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
     */
    async onConfirm(response) {
        try {
            const { messageId } = response;

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
    */
    async onInit(response) {
        try {
            const { messageId } = response;

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
    */
    async onSearch(response) {
        try {
            const { messageId } = response;
                
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
    */
    async onQuote(response) {
        try {
            const { messageId } = response;
            console.log("select call service send data ----", new Date(), response);

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
    */
    async onStatus(response) {
        try {
            const { messageId } = response;

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
    */
    async onSupport(response) {
        try {
            const { messageId } = response;

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
    */
    async onTrack(response) {
        try {
            const { messageId } = response;

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