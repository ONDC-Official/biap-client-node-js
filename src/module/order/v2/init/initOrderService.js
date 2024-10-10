import { onOrderInit } from "../../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../../utils/constants.js";
import { getOrderByTransactionIdAndProvider, addOrUpdateOrderWithTransactionIdAndProvider } from "../../v1/db/dbService.js";

import BppInitService from "./bppInitService.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import SearchService from "../../../discovery/v2/searchService.js";
import crypto from 'crypto';

const bppSearchService = new SearchService();
const bppInitService = new BppInitService();

/**
 * Service for initializing and managing orders.
 */
class InitOrderService {

    /**
     * Generates a short hash from the input string using SHA-256.
     * @param {String} input - The string to be hashed.
     * @returns {String} - A 12-character shortened hash.
     */
    async getShortHash(input) {
        const hash = crypto.createHash('sha256').update(input).digest('base64');
        return hash.substring(0, 12);
    }

    /**
     * Checks if multiple BPP items are selected.
     * @param {Array} items - List of items to check.
     * @returns {Boolean} - True if multiple BPPs are selected, else false.
     */
    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    /**
     * Checks if multiple provider items are selected.
     * @param {Array} items - List of items to check.
     * @returns {Boolean} - True if multiple providers are selected, else false.
     */
    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    /**
     * Creates an order in the database.
     * @param {Object} response - The protocol response.
     * @param {String} userId - The user's unique identifier.
     * @param {Object} orderRequest - The order request details.
     */
    async createOrder(response, userId = null, orderRequest) {
        if (response) {
            const provider = orderRequest?.items?.[0]?.provider || {};
            const providerDetails = {
                id: provider.local_id,
                descriptor: provider.descriptor,
                locations: provider.locations.map(location => ({ id: location.local_id }))
            };

            // Logging request information
            console.log("Creating order with delivery info:", orderRequest?.delivery_info);

            const fulfillment = {
                end: {
                    contact: {
                        email: orderRequest?.delivery_info?.email,
                        phone: orderRequest?.delivery_info?.phone
                    },
                    location: {
                        ...orderRequest?.delivery_info?.location,
                        address: {
                            ...orderRequest?.delivery_info?.location?.address,
                            name: orderRequest?.delivery_info?.name
                        }
                    }
                },
                type: orderRequest?.delivery_info?.type,
                customer: { person: { name: orderRequest?.delivery_info?.name } },
                provider_id: provider?.local_id
            };

            let itemProducts = [];
            for (let item of orderRequest.items) {
                let parentItemKeys = item.customisations ?
                    `${item.local_id}_${item.customisations.map(c => c.local_id).join('_')}` :
                    item.local_id.toString();

                let parentItemId = await this.getShortHash(parentItemKeys);
                let selectitem = {
                    id: item.local_id.toString(),
                    quantity: item.quantity,
                    location_id: provider.locations[0].local_id.toString(),
                    fulfillment_id: item.fulfillment_id,
                    product: item.product,
                    parent_item_id: item.parent_item_id ? parentItemId : undefined
                };

                if (item.tags?.length > 0) {
                    let tag = item.tags.find(i => i.code === 'type');
                    if (tag) selectitem.tags = [tag];
                }

                itemProducts.push(selectitem);

                // Adding customisations to products
                if (item.customisations) {
                    for (let customisation of item.customisations) {
                        let selectitem = {
                            id: customisation.local_id.toString(),
                            quantity: customisation.quantity,
                            location_id: provider.locations[0].local_id.toString(),
                            parent_item_id: parentItemId,
                            fulfillment_id: item.fulfillment_id,
                            product: customisation
                        };

                        let tag = customisation.item_details.tags?.filter(i => i.code === 'type' || i.code === 'parent');
                        if (tag?.length > 0) selectitem.tags = tag;

                        itemProducts.push(selectitem);
                    }
                }
            }

            // Logging order details
            console.log('Order items:', itemProducts);
            console.log('Fulfillment details:', fulfillment);

            await addOrUpdateOrderWithTransactionIdAndProvider(
                response.context.transaction_id,
                provider.local_id,
                {
                    userId,
                    messageId: response.context.message_id,
                    transactionId: response.context.transaction_id,
                    parentOrderId: response.context.parent_order_id,
                    bppId: response.context.bpp_id,
                    bpp_uri: response.context.bpp_uri,
                    fulfillments: [fulfillment],
                    provider: providerDetails,
                    items: itemProducts,
                    offers: orderRequest.offers,
                    coupon: orderRequest.coupon
                }
            );
        }
    }

    /**
     * Updates an order in the database.
     * @param {Object} response - The protocol response containing the order data.
     * @param {Object} dbResponse - The existing order data from the database.
     */
    async updateOrder(response, dbResponse) {
        if (response?.message?.order && dbResponse) {
            let orderSchema = { ...response.message.order };
            dbResponse = dbResponse.toJSON();

            orderSchema.items = dbResponse.items.map(item => ({
                id: item.id.toString(),
                quantity: item.quantity,
                product: item.product,
                fulfillment_id: item.fulfillment_id,
                tags: item.tags,
                parent_item_id: item.parent_item_id
            }));

            orderSchema.provider = {
                id: orderSchema.provider?.id,
                locations: orderSchema.provider?.locations ?? [],
                descriptor: dbResponse.provider?.descriptor
            };

            orderSchema.fulfillments = [orderSchema.fulfillment];
            delete orderSchema.fulfillment;

            // Logging the updated order details
            console.log('Updating order with:', orderSchema);

            await addOrUpdateOrderWithTransactionIdAndProvider(
                response.context.transaction_id,
                dbResponse.provider.id,
                { ...orderSchema }
            );
        }
    }

    /**
     * Initializes a new order.
     * @param {Object} orderRequest - The order request payload.
     * @param {Boolean} isMultiSellerRequest - Indicates if the order involves multiple sellers.
     * @returns {Object} - The BPP response for the initialized order.
     */
    async initOrder(orderRequest, isMultiSellerRequest = false) {
        try {
            const { context: requestContext = {}, message: order = {} } = orderRequest || {};
            const parentOrderId = requestContext?.transaction_id;

            // Logging the order request
            console.log('Initializing order:', orderRequest);

            let itemPresent = true;
            let itemContext = {};
            for (let [index, item] of order.items.entries()) {
                let items = await bppSearchService.getItemDetails({ id: item.id });
                if (!items) itemPresent = false;
                else itemContext = items.context;
            }

            if (!itemPresent) return { error: { message: "Request is invalid" } };

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.INIT,
                bppId: itemContext?.bpp_id,
                bpp_uri: itemContext?.bpp_uri,
                city: requestContext.city,
                state: requestContext.state,
                transactionId: requestContext?.transaction_id,
                domain: requestContext?.domain,
                pincode: requestContext?.pincode
            });

            if (!(order?.items?.length)) {
                return { context, error: { message: "Empty order received" } };
            } else if (this.areMultipleBppItemsSelected(order.items)) {
                return { context, error: { message: "More than one BPP's item(s) selected/initialized" } };
            } else if (this.areMultipleProviderItemsSelected(order.items)) {
                return { context, error: { message: "More than one Provider's item(s) selected/initialized" } };
            }

            const bppResponse = await bppInitService.init(context, order, parentOrderId);
            return bppResponse;
        } catch (err) {
            console.error('Error initializing order:', err);
            throw err;
        }
    }

    /**
     * Initializes multiple orders.
     * @param {Array} orders - List of order requests.
     * @param {Object} user - The user information.
     * @returns {Array} - Array of responses for each initialized order.
     */
    async initMultipleOrder(orders, user) {
        console.log('Initializing multiple orders:', orders);

        const initOrderResponse = await Promise.all(
            orders.map(async order => {
                try {
                    const bppResponse = await this.initOrder(order, orders.length > 1);
                    await this.createOrder(bppResponse, user?.decodedToken?.uid, order?.message);
                    return bppResponse;
                } catch (err) {
                    console.error('Error initializing order for:', order?.message?.order_id, err);
                    return { error: err.message };
                }
            })
        );
        return initOrderResponse;
    }

    /**
     * Saves or updates an order in the database.
     * @param {Object} response - The protocol response with the order data.
     * @param {String} transactionId - The transaction ID to identify the order.
     */
    async saveOrder(response, transactionId) {
        try {
            const dbResponse = await getOrderByTransactionIdAndProvider(transactionId, response.context?.bpp_id);
            if (dbResponse) {
                console.log("Order found, updating existing order.");
                await this.updateOrder(response, dbResponse);
            } else {
                console.log("No existing order found, creating a new order.");
                await this.createOrder(response);
            }
        } catch (err) {
            console.error('Error saving order:', err);
            throw err;
        }
    }
}

export default InitOrderService;
