import { protocolRating } from "../../../../utils/protocolApis/index.js";

/**
 * Service for handling BPP ratings.
 */
class BppRatingService {

    /**
     * Sends a request to rate an order on the BPP platform.
     * @param {Object} context - The context of the rating request.
     * @param {Array} ratings - List of ratings to be submitted. Default is an empty array.
     * @returns {Object} - The response containing the context and rating message.
     */
    async getRating(context, ratings = []) {
        try {
            // Constructing the rating request payload
            const rateRequest = {
                context: context,
                message: {
                    ratings: ratings
                }
            };

            // Logging the rating request
            console.log("Rating request payload:", JSON.stringify(rateRequest));

            // Sending the rating request to the protocol API
            const response = await protocolRating(rateRequest);

            // Returning the response with context and message
            return { context: context, message: response.message };
        } catch (err) {
            // Logging the error details
            console.error("Error in rating submission:", err);

            // Re-throwing the error for further handling
            throw err;
        }
    }
}

export default BppRatingService;
