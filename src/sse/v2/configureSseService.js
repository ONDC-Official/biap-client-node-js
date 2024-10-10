import _ from "lodash";
import SseEvent from "./sseEventService.js";
import logger from '../../lib/logger/index.js'; // Import your logger

class ConfigureSSE {
    /**
     * Initializes a new instance of ConfigureSSE.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {string} messageId - The ID of the message.
     * @param {Object} message - The message content.
     * @param {boolean} [action=false] - Optional action flag.
     */
    constructor(req, res, messageId, message, action) {
        this.req = req;
        this.res = res;
        this.messageId = messageId;
        this.message = message;
        this.action = action || false;
    }

    /**
     * Initializes the SSE (Server-Sent Events) connection.
     * @returns {SseEvent} - The initialized SSE event instance.
     */
    initialize() {
        try {
            logger.info('[ConfigureSSE] Initializing SSE', {
                messageId: this.messageId,
                action: this.action,
            });

            let message = [];

            if (this.message && !_.isEmpty(this.message)) {
                message = this.message;
            }

            const sse = new SseEvent(message, {
                initialEvent: this.action,
                eventId: this.messageId
            });

            sse.init(this.req, this.res);

            logger.info('[ConfigureSSE] SSE initialized successfully');
            return sse;
        } catch (err) {
            logger.error(`[ConfigureSSE] Error initializing SSE: ${err.message}`);
            throw err;
        }
    }
}

export default ConfigureSSE;
