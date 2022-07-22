import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderQuote } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../../utils/constants.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppQuoteService from "./bppQuote.service.js";

const bppQuoteService = new BppQuoteService();

class QuoteOrderService {

    /**
     * 
     * @param {Array} items 
     * @returns Boolean
     */
    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    /**
     * 
     * @param {Array} items 
     * @returns Boolean
     */
    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    /**
     * 
     * @param {Object} response 
     * @returns 
     */
    transform(response) {
        return {
            context: response?.context,
            message: {
                quote: {
                    ...response?.message?.order
                }
            }
        };
    }

    /**
    * quote order
    * @param {Object} orderRequest
    */
    async quoteOrder(orderRequest) {
        try {
            const { context: requestContext, message = {} } = orderRequest || {};
            const { cart = {} } = message;

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.SELECT,
                transactionId: requestContext?.transaction_id,
                bppId: cart?.items[0]?.bpp_id
            });

            if (!(cart?.items || cart?.items?.length)) {
                return { 
                    context, 
                    error: { message: "Empty order received" }
                };
            } else if (this.areMultipleBppItemsSelected(cart?.items)) {
                return { 
                    context, 
                    error: { message: "More than one BPP's item(s) selected/initialized" }
                };
            }
            else if (this.areMultipleProviderItemsSelected(cart?.items)) {
                return { 
                    context, 
                    error: { message: "More than one Provider's item(s) selected/initialized" }
                };
            }

            const subscriberDetails = await lookupBppById({
                type: SUBSCRIBER_TYPE.BPP,
                subscriber_id: context?.bpp_id
            });

            return await bppQuoteService.quote(
                context,
                subscriberDetails?.[0]?.subscriber_url,
                cart
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * quote multiple orders
     * @param {Array} requests 
     */
    async quoteMultipleOrder(requests) {

        const quoteOrderResponse = await Promise.all(
            requests.map(async request => {
                try {
                    const response = await this.quoteOrder(request);
                    return response;
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return quoteOrderResponse;
    }

    /**
    * on quote order
    * @param {Object} messageId
    */
    async onQuoteOrder(messageId) {
        try {
            const protocolQuoteResponse = await onOrderQuote(messageId);

            if (!(protocolQuoteResponse && protocolQuoteResponse.length)  ||
                protocolQuoteResponse?.[0]?.error) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_SELECT
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            } else {
                return this.transform(protocolQuoteResponse?.[0]);
            }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on quote multiple order
    * @param {Object} messageId
    */
    async onQuoteMultipleOrder(messageIds) {
        try {
            const onQuoteOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onQuoteResponse = await this.onQuoteOrder(messageId);
                        return { ...onQuoteResponse };
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onQuoteOrderResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default QuoteOrderService;
