import { PROTOCOL_CONTEXT } from '../utils/constants.js';
import { sendSSEResponse } from '../utils/sse.js';
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