import { protocolSelect } from "../../../../utils/protocolApis/index.js";
import crypto from 'crypto';

/**
 * Service for handling BPP select order operations.
 */
class BppSelectService {

    /**
     * Generates a short hash of the input string using SHA-256.
     * @param {String} input - The input string to hash.
     * @return {String} Returns the first 12 characters of the base64-encoded hash.
     */
    async getShortHash(input) {
        // Create a SHA-256 hash of the input string
        const hash = crypto.createHash('sha256').update(input).digest('base64');
        // Take the first 12 characters of the base64 hash
        return hash.substring(0, 12);
    }

    /**
     * Handles the select order request.
     * @param {Object} context - The request context.
     * @param {Object} order - The order details, including cart, fulfillments, offers, and coupon.
     * @return {Promise<Object>} Returns the response from the protocol select API.
     */
    async select(context, order = {}) {
        try {
            const { cart = {}, fulfillments = [], offers = undefined, coupon = undefined } = order || {};
            const provider = cart?.items?.[0]?.provider || {};

            let items = [];
            let locationSet = new Set();

            // Process each item in the cart
            for (let [index, item] of cart.items.entries()) {
                let parentItemKeys;
                if (item.customisations) {
                    parentItemKeys = item?.local_id?.toString() + '_' + item.customisations.map(item => item.local_id).join('_');
                } else {
                    parentItemKeys = item?.local_id?.toString();
                }

                // Generate a short hash for the parent item
                let parentItemId = await this.getShortHash(parentItemKeys);

                let selectItem = {
                    id: item?.local_id?.toString(),
                    quantity: item?.quantity,
                    location_id: item?.product?.location_id?.toString()
                };

                locationSet.add(item?.product?.location_id?.toString());

                // Add tags if available
                if (item.tags && item.tags.length > 0) {
                    let tag = item.tags.find(i => i.code === 'type');
                    if (tag) {
                        selectItem.tags = [tag];
                    }
                }

                // Handle customizations
                if (item.customisations && item.customisations.length > 0) {
                    selectItem.parent_item_id = parentItemId;
                }

                items.push(selectItem);

                // Add customization items to the select list
                if (item.customisations) {
                    for (let customisation of item.customisations) {
                        let selectCustomItem = {
                            id: customisation?.local_id?.toString(),
                            quantity: customisation.quantity,
                            location_id: item?.product?.location_id?.toString()
                        };

                        // Add tags for customizations
                        let tag = undefined;
                        if (customisation.item_details?.tags && customisation.item_details?.tags.length > 0) {
                            tag = customisation.item_details.tags.filter(i => i.code === 'type' || i.code === 'parent');
                            let finalTags = [];

                            for (let tg of tag) {
                                if (tg.code === 'parent') {
                                    if (tg.list.length > 0) {
                                        tg.list = tg.list.filter(i => i.code === 'id');
                                    }
                                    finalTags.push(tg);
                                } else {
                                    finalTags.push(tg);
                                }
                            }
                            selectCustomItem.tags = finalTags;
                        }

                        selectCustomItem.parent_item_id = parentItemId;
                        items.push(selectCustomItem);
                    }
                }
            }

            // Create the select order request
            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: items,
                        provider: {
                            id: provider?.local_id,
                            locations: Array.from(locationSet).map(location => ({
                                id: location
                            }))
                        },
                        fulfillments: fulfillments && fulfillments.length ? [...fulfillments] : []
                    }
                }
            };

            // Add offers to the request if available
            if (offers && offers.length) {
                selectRequest.message.order.offers = offers;
            }

            console.log("Select order request:", JSON.stringify(selectRequest));

            // Send the request to the protocol API
            const response = await protocolSelect(selectRequest);
            return { context: context, message: response.message };

        } catch (err) {
            console.error("Error in select order:", err);
            if (err.response) {
                err.response.data.selectRequest = order;
            }
            throw err;
        }
    }
}

export default BppSelectService;
