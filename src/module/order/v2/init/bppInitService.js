import { protocolInit } from "../../../../utils/protocolApis/index.js";
import crypto from 'crypto';
import logger from '../../../../lib/logger/index.js'; // Adjust this to your actual logger import

class BppInitService {
    /**
     * Generates a short SHA-256 hash of the given input.
     * @param {string} input - The input string to hash.
     * @returns {Promise<string>} - A promise that resolves to the first 12 characters of the base64 hash.
     */
    async getShortHash(input) {
        // Create a SHA-256 hash of the input string
        const hash = crypto.createHash('sha256').update(input).digest('base64');

        // Take the first 12 characters of the base64 hash
        return hash.substring(0, 12);
    }

    /**
     * Initializes the BPP order with the given context and order details.
     * @param {Object} context - The context for the BPP order.
     * @param {Object} [order={}] - The order details.
     * @param {string} parentOrderId - The parent order ID.
     * @returns {Promise<Object>} - A promise that resolves to the response message containing order details.
     * @throws {Error} - Throws an error if the initialization fails.
     */
    async init(context, order = {}, parentOrderId) {
        try {
            const provider = order?.items?.[0]?.provider || {};

            logger.info("Context:", context);
            order.delivery_info.location.address.area_code = order.delivery_info.location.address.areaCode;
            delete order.delivery_info.location.address.areaCode;

            order.billing_info.address.area_code = order.billing_info.address.areaCode;
            delete order.billing_info.address.areaCode;

            order.billing_info.address.locality = order.billing_info.address.street;
            order.delivery_info.location.address.locality = order.delivery_info.location.address.street;

            const fulfillments = order?.fulfillments;
            let fulfillment = {};
            if (fulfillments && fulfillments.length > 0) { // TODO: Feature pending for dynamic fulfillments
                fulfillment = fulfillments[0];
            }

            // Clean up unnecessary address fields
            ['tag', 'lat', 'lng', 'street', 'ward', 'door'].forEach(field => {
                delete order.billing_info.address[field];
                delete order.delivery_info.location.address[field];
            });

            // Check if item has customization present
            let items = [];
            let locationSet = new Set();
            for (let item of order.items) {
                // Create hash of item.id and all customization.id to prepare 12 char hash ie parent item id
                let parentItemKeys = item.customisations
                    ? `${item.local_id}_${item.customisations.map(c => c.local_id).join('_')}`
                    : item.local_id?.toString();

                let parentItemId = await this.getShortHash(parentItemKeys);

                let selectitem = {
                    id: item.local_id?.toString(),
                    quantity: item.quantity,
                    location_id: item.product?.location_id?.toString(),
                    tags: item.tags?.find(t => t.code === 'type') ? [item.tags.find(t => t.code === 'type')] : undefined,
                    fulfillment_id: item.fulfillment_id,
                };

                locationSet.add(item.product?.location_id?.toString());
                if (item.parent_item_id) {
                    selectitem.parent_item_id = parentItemId;
                }

                items.push(selectitem);
                if (item.customisations) {
                    for (let customisation of item.customisations) {
                        let selectitem = {
                            id: customisation.local_id?.toString(),
                            quantity: customisation.quantity,
                            location_id: item.product?.location_id?.toString(),
                            tags: this.processTags(customisation.item_details.tags),
                            fulfillment_id: item.fulfillment_id,
                            parent_item_id: parentItemId,
                        };
                        items.push(selectitem);
                    }
                }
            }

            const initRequest = {
                context: context,
                message: {
                    order: {
                        provider: {
                            id: provider.local_id,
                            locations: Array.from(locationSet).map(location => ({ id: location })),
                        },
                        items: items,
                        billing: {
                            ...order.billing_info,
                            address: {
                                ...order.billing_info.address,
                                name: order.billing_info.name,
                                area_code: order.billing_info.address.area_code,
                            },
                            created_at: context.timestamp,
                            updated_at: context.timestamp,
                        },
                        fulfillments: [{
                            id: fulfillment?.id,
                            type: order.delivery_info.type,
                            end: {
                                contact: {
                                    email: order.delivery_info.email,
                                    phone: order.delivery_info.phone,
                                },
                                location: {
                                    ...order.delivery_info.location,
                                    address: {
                                        ...order.delivery_info.location.address,
                                        name: order.delivery_info.name,
                                        area_code: order.delivery_info.location.address.area_code,
                                    },
                                },
                            },
                        }],
                    },
                },
            };

            if (order.offers && order.offers.length) {
                initRequest.message.order.offers = order.offers.map(offer => ({ id: offer }));
            }

            logger.info("Init Request:", JSON.stringify(initRequest));

            const response = await protocolInit(initRequest);

            return {
                context: {
                    ...context,
                    parent_order_id: parentOrderId,
                    provider_id: provider.id,
                },
                message: response.message,
            };
        } catch (err) {
            logger.error("Error during initialization:", err);
            err.response.data.initRequest = order;
            throw err;
        }
    }

    /**
     * Processes tags for customisation items.
     * @param {Array} tags - The tags to process.
     * @returns {Array} - The processed tags.
     */
    processTags(tags) {
        if (!tags || tags.length === 0) return undefined;

        let finalTags = [];
        for (let tag of tags) {
            if (tag.code === 'parent' && tag.list.length > 0) {
                tag.list = tag.list.filter(i => i.code === 'id');
            }
            finalTags.push(tag);
        }
        return finalTags;
    }
}

export default BppInitService;
