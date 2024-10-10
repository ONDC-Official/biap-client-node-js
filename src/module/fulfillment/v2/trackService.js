import { onOrderTrack } from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import BppTrackService from "./bppTrackService.js";
import ContextFactory from "../../factories/ContextFactory.js";
import { getOrderById } from "../../order/v1/db/dbService.js";
import logger from '../../../lib/logger/index.js'; // Assuming you have a logger utility

const bppTrackService = new BppTrackService();

class TrackService {

    /**
     * Track a single order.
     * @param {Object} trackRequest - The request object containing order tracking details.
     * @returns {Object} - The response from the BPP track service.
     */
    async track(trackRequest) {
        try {
            const { context: requestContext } = trackRequest || {};

            // Log the incoming track request
            logger.info("Tracking order:", trackRequest.message.order_id);

            const orderDetails = await getOrderById(trackRequest.message.order_id);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.TRACK,
                transactionId: orderDetails?.transactionId,
                bppId: requestContext?.bpp_id,
                cityCode: orderDetails.city
            });

            return await bppTrackService.track(
                context,
                trackRequest
            );
        }
        catch (err) {
            logger.error("Error tracking order:", err);
            throw err;
        }
    }

    /**
     * Track multiple orders.
     * @param {Array} requests - An array of tracking request objects.
     * @returns {Array} - An array of responses from the BPP track service.
     */
    async trackMultipleOrder(requests) {
        const trackResponses = await Promise.all(
            requests.map(async request => {
                try {
                    const trackResponse = await this.track(request);
                    return trackResponse;
                }
                catch (err) {
                    logger.error("Error tracking multiple orders:", err);
                    throw err;
                }
            })
        );

        return trackResponses;
    }

    /**
     * Retrieve tracking information for a single order.
     * @param {string} messageId - The ID of the message to track.
     * @returns {Object} - The tracking response or context with error message.
     */
    async onTrack(messageId) {
        try {
            logger.info("Retrieving tracking information for messageId:", messageId);
            const protocolTrackResponse = await onOrderTrack(messageId);

            if (protocolTrackResponse && protocolTrackResponse.length) {
                return protocolTrackResponse?.[0];
            } else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_TRACK
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
        }
        catch (err) {
            logger.error("Error retrieving tracking information:", err);
            throw err;
        }
    }

    /**
     * Retrieve tracking information for multiple orders.
     * @param {Array} messageIds - An array of message IDs to track.
     * @returns {Array} - An array of tracking responses.
     */
    async onTrackMultipleOrder(messageIds) {
        try {
            const onTrackResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onTrackResponse = await this.onTrack(messageId);
                        return { ...onTrackResponse };
                    }
                    catch (err) {
                        logger.error("Error on track multiple orders:", err);
                        throw err;
                    }
                })
            );

            return onTrackResponse;
        }
        catch (err) {
            logger.error("Error in onTrackMultipleOrder:", err);
            throw err;
        }
    }
}

export default TrackService;
