import _ from "lodash";
import SseEvent from "./sseEvent.service.js";

class ConfigureSSE {

    constructor(req, res, messageId, message, action) {
        this.req = req;
        this.res = res;
        this.messageId = messageId;
        this.message = message;
        this.action = action || false;
    };

    initialize() {
        try {
            let message = [];

            if (this.message && !_.isEmpty(message))
                message = this.message;

            const sse = new SseEvent(
                message,
                {
                    initialEvent: this.action,
                    eventId: this.messageId
                }
            );

            sse.init(this.req, this.res);

            return sse;
        }
        catch (err) {
            throw err;
        }
    };
}

export default ConfigureSSE;
