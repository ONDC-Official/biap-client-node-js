import { onOrderSelect } from "../../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../../utils/constants.js";
import { RetailsErrorCode } from "../../../../utils/retailsErrorCode.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import BppSelectService from "./bppSelectService.js";
import SearchService from "../../../discovery/v2/searchService.js";

const bppSearchService = new SearchService();
const bppSelectService = new BppSelectService();

/**
 * Service for handling order selection operations.
 */
class SelectOrderService {

    /**
     * Checks if multiple BPP items are selected.
     * @param {Array} items - List of items to check.
     * @returns {Boolean} True if items from multiple BPPs are selected, false otherwise.
     */
    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    /**
     * Checks if multiple provider items are selected.
     * @param {Array} items - List of items to check.
     * @returns {Boolean} True if items from multiple providers are selected, false otherwise.
     */
    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    /**
     * Transforms the response into the required structure.
     * @param {Object} response - The response to transform.
     * @returns {Object} The transformed response.
     */
    transform(response) {
        const error = response.error ? {
            ...response.error,
            message: response.error.message || RetailsErrorCode[response.error.code],
        } : null;

        return {
            context: response?.context,
            message: {
                quote: {
                    ...response?.message?.order
                }
            },
            error
        };
    }

    /**
     * Selects an order.
     * @param {Object} orderRequest - The order request to process.
     * @returns {Promise<Object>} The response of the selection process.
     */
    async selectOrder(orderRequest) {
        try {
            const { context: requestContext, message = {} } = orderRequest || {};
            const { cart = {}, fulfillments = [], offers = [] } = message;

            let itemContext = {};
            let itemPresent = true;

            // Check if the items are available by fetching their details.
            for (let item of cart.items) {
                const items = await bppSearchService.getItemDetails({ id: item.id });
                if (!items) {
                    itemPresent = false;
                } else {
                    itemContext = items.context;
                }
            }

            if (!itemPresent) {
                return { error: { message: "Invalid request" } };
            }

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.SELECT,
                transactionId: requestContext?.transaction_id,
                bppId: itemContext?.bpp_id,
                bpp_uri: itemContext?.bpp_uri,
                city: requestContext?.city,
                pincode: requestContext?.pincode,
                state: requestContext?.state,
                domain: requestContext?.domain
            });

            if (!cart?.items?.length) {
                return { context, error: { message: "Empty order received" } };
            } else if (this.areMultipleBppItemsSelected(cart?.items)) {
                return { context, error: { message: "More than one BPP's item(s) selected/initialized" } };
            } else if (this.areMultipleProviderItemsSelected(cart?.items)) {
                return { context, error: { message: "More than one Provider's item(s) selected/initialized" } };
            }

            return await bppSelectService.select(context, { cart, fulfillments, offers });
        } catch (err) {
            throw err;
        }
    }

    /**
     * Selects multiple orders.
     * @param {Array} requests - List of order requests to process.
     * @returns {Promise<Array>} The responses of the selection process.
     */
    async selectMultipleOrder(requests) {
        console.log("requests--->", JSON.stringify(requests));
        const selectOrderResponses = await Promise.all(
            requests.map(async (request) => {
                try {
                    return await this.selectOrder(request);
                } catch (err) {
                    return err;
                }
            })
        );
        return selectOrderResponses;
    }

    /**
     * Handles the select order callback for a specific messageId.
     * @param {String} messageId - The message ID of the select order request.
     * @returns {Promise<Object>} The transformed response for the select order.
     */
    async onSelectOrder(messageId) {
        try {
            const protocolSelectResponse = await onOrderSelect(messageId);
            return this.transform(protocolSelectResponse?.[0]);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Handles the select order callback for multiple messageIds.
     * @param {Array} messageIds - List of message IDs for the select order requests.
     * @returns {Promise<Array>} The transformed responses for the select orders.
     */
    async onSelectMultipleOrder(messageIds) {
        try {
            const onSelectOrderResponses = await Promise.all(
                messageIds.map(async (messageId) => {
                    try {
                        return await this.onSelectOrder(messageId);
                    } catch (err) {
                        throw err;
                    }
                })
            );
            return onSelectOrderResponses;
        } catch (err) {
            throw err;
        }
    }
}

export default SelectOrderService;
