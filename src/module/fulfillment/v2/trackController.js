import TrackService from './trackService.js';
import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';
import logger from '../../../lib/logger/index.js'; // Assuming you have a logger utility

const trackService = new TrackService();

class TrackController {

    /**
     * Track an order.
     * @param {*} req - HTTP request object.
     * @param {*} res - HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {void}
     */
    track(req, res, next) {
        const { body: trackRequest } = req;
        logger.info("Track order request received:", trackRequest);

        if(trackRequest.context.bpp_id) {
            trackService.track(trackRequest).then(response => {
                logger.info("Track order response sent:", response);
                res.json({ ...response });
            }).catch((err) => {
                logger.error("Error tracking order:", err);
                next(err);
            });
        } else {
            logger.warn("BPP Id is missing in the request.");
            throw new BadRequestParameterError("BPP Id is mandatory");
        }
    }

    /**
     * Track multiple orders.
     * @param {*} req - HTTP request object.
     * @param {*} res - HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {void}
     */
    trackMultipleOrder(req, res, next) {
        const { body: trackRequests } = req;
        logger.info("Track multiple orders request received:", trackRequests);

        if (trackRequests && trackRequests.length) {
            trackService.trackMultipleOrder(trackRequests).then(response => {
                logger.info("Track multiple orders response sent:", response);
                res.json(response);
            }).catch((err) => {
                logger.error("Error tracking multiple orders:", err);
                next(err);
            });
        } else {
            logger.warn("Track requests array is missing or empty.");
            throw new BadRequestParameterError();
        }
    }

    /**
     * On track order.
     * @param {*} req - HTTP request object.
     * @param {*} res - HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {void}
     */
    onTrack(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        logger.info("On track order request received for messageId:", messageId);

        if (messageId && messageId.length) {
            trackService.onTrack(messageId).then(response => {
                logger.info("On track order response sent:", response);
                res.json(response);
            }).catch((err) => {
                logger.error("Error in on track order:", err);
                next(err);
            });
        } else {
            logger.warn("Message Id is missing in the request.");
            throw new BadRequestParameterError("message Id is mandatory");
        }
    }

    /**
     * On track multiple orders.
     * @param {*} req - HTTP request object.
     * @param {*} res - HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {void}
     */
    onTrackMultipleOrder(req, res, next) {
        const { query } = req;
        const { messageIds } = query;
        logger.info("On track multiple orders request received for messageIds:", messageIds);

        if (messageIds && messageIds.length && messageIds.trim().length) {
            const messageIdArray = messageIds.split(",");

            trackService.onTrackMultipleOrder(messageIdArray).then(response => {
                logger.info("On track multiple orders response sent:", response);
                res.json(response);
            }).catch((err) => {
                logger.error("Error in on track multiple orders:", err);
                next(err);
            });
        } else {
            logger.warn("Message IDs are missing or invalid.");
            throw new BadRequestParameterError();
        }
    }
}

export default TrackController;
