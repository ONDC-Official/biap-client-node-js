import { PROTOCOL_CONTEXT } from "../../../../utils/constants.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import BppRatingService from "./bppRatingService.js";
import Rating from "../db/fulfillments copy.js";
import { getOrderById } from "../../v1/db/dbService.js";

const bppRatingService = new BppRatingService();

/**
 * Service to handle rating operations for orders.
 */
class RatingService {

    /**
     * Rates an order and saves the rating to the database.
     * @param {Array} rating - Array of rating objects.
     * @param {String} id - Order ID to associate the ratings with.
     * @return {Promise<Object>} Returns the response from BppRatingService.
     */
    async rateOrder(rating, id) {
        try {
            // Fetch order details by order ID
            const orderDetails = await getOrderById(id);

            console.log('Fetched order details:', orderDetails);

            // Loop through each rating and save it to the database
            for (let ratingDetails of rating) {
                let oldRating = await Rating.findOne({
                    orderId: id,
                    type: ratingDetails.rating_category,
                    entityId: ratingDetails.id
                });

                console.log("Existing rating found:", oldRating);

                if (oldRating) {
                    // Update existing rating
                    oldRating.rating = ratingDetails.value;
                    await oldRating.save();
                } else {
                    // Create a new rating
                    let newRating = new Rating();
                    newRating.type = ratingDetails.rating_category;
                    newRating.entityId = ratingDetails.id;
                    newRating.rating = ratingDetails.value;
                    newRating.orderId = id;
                    await newRating.save();
                }
            }

            // Create context using ContextFactory
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.RATING,
                transactionId: orderDetails[0]?.transactionId,
                bppId: orderDetails[0]?.bppId,
                bpp_uri: orderDetails[0]?.bpp_uri,
                cityCode: orderDetails[0].city,
                city: orderDetails[0].city,
                domain: orderDetails[0].domain
            });

            // Call BppRatingService to submit the rating
            return await bppRatingService.getRating(context, rating);
        } catch (err) {
            console.error("Error while rating order:", err);
            throw err;
        }
    }

    /**
     * Retrieves the rating for a specific order.
     * @param {Array} rating - Array of rating objects.
     * @param {String} id - Order ID to retrieve ratings for.
     * @return {Promise<Array>} Returns an array of ratings for the order.
     */
    async getRating(rating, id) {
        try {
            // Fetch all ratings for the given order ID
            const ratings = await Rating.find({ orderId: id }).lean();
            console.log("Fetched ratings:", ratings);
            return ratings;
        } catch (err) {
            console.error("Error while fetching ratings:", err);
            throw err;
        }
    }

    /**
     * Handles multiple rating requests by their message IDs.
     * @param {Array} messageIds - Array of message IDs to process ratings for.
     * @return {Promise<Array>} Returns an array of responses for each rating request.
     */
    async onRateOrder(messageIds) {
        try {
            // Process each messageId asynchronously
            const onSelectOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onSelectResponse = await this.onSelectOrder(messageId);
                        return { ...onSelectResponse };
                    } catch (err) {
                        console.error("Error while processing rating for messageId:", messageId, err);
                        throw err;
                    }
                })
            );

            return onSelectOrderResponse;
        } catch (err) {
            console.error("Error while processing multiple rating requests:", err);
            throw err;
        }
    }
}

export default RatingService;
