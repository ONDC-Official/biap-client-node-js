import { protocolTrack } from "../../../utils/protocolApis/index.js";
import logger from '../../../lib/logger/index.js'; // Assuming you have a logger utility

class BppTrackService {

    /**
     * Track an order using the provided context and request.
     * @param {Object} context - The context object containing relevant information.
     * @param {Object} request - The request object containing message details.
     * @returns {Promise<Object>} - The response containing context and message.
     * @throws {Error} - Throws an error if tracking fails.
     */
    async track(context = {}, request = {}) {
        try {
            logger.info("Tracking request initiated:", { context, request });

            const trackRequest = {
                context: context,
                message: {
                    ...request.message
                }
            };

            const response = await protocolTrack(trackRequest);
            logger.info("Tracking response received:", response);

            return { context: context, message: response.message };
        } catch (err) {
            logger.error("Error in tracking order:", err);
            throw err; // Re-throw the error for handling by the caller
        }
    }
}

export default BppTrackService;
