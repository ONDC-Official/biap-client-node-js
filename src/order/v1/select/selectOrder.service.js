import { onOrderSelect } from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import {RetailsErrorCode} from "../../../utils/retailsErrorCode.js";

import ContextFactory from "../../../factories/ContextFactory.js";
import BppSelectService from "./bppSelect.service.js";

const bppSelectService = new BppSelectService();

class SelectOrderService {

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

        let error =  response.error ? Object.assign({}, response.error, {
            message: RetailsErrorCode[response.error.code],
        }):null;

        return {
            context: response?.context,
            message: {
                quote: {
                    ...response?.message?.order
                }
            },
            error:error
        };
    }

    /**
    * select order
    * @param {Object} orderRequest
    */
    async selectOrder(orderRequest) {
        try {
            const { context: requestContext, message = {} } = orderRequest || {};
            const { cart = {}, fulfillments = [] } = message;

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.SELECT,
                transactionId: requestContext?.transaction_id,
                bppId: cart?.items[0]?.bpp_id,
                bpp_uri: cart?.items[0]?.bpp_uri,
                city:requestContext?.city,
                state:requestContext?.state
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

            return await bppSelectService.select(
                context,
                { cart, fulfillments }
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * select multiple orders
     * @param {Array} requests 
     */
    async selectMultipleOrder(requests) {

        const selectOrderResponse = await Promise.all(
            requests.map(async request => {
                try {
                    const response = await this.selectOrder(request);
                    return response;
                }
                catch (err) {
                    return err.response.data;
                }
            })
        );

        return selectOrderResponse;
    }

    /**
    * on select order
    * @param {Object} messageId
    */
    async onSelectOrder(messageId) {
        try {
            const protocolSelectResponse = await onOrderSelect(messageId);

            // if (!(protocolSelectResponse && protocolSelectResponse.length)  ||
            //     protocolSelectResponse?.[0]?.error) {
            //     const contextFactory = new ContextFactory();
            //     const context = contextFactory.create({
            //         messageId: messageId,
            //         action: PROTOCOL_CONTEXT.ON_SELECT
            //     });
            //
            //     return {
            //         context,
            //         error: protocolSelectResponse?.[0]?.error
            //     };
            // } else {
                return this.transform(protocolSelectResponse?.[0]);
            // }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on select multiple order
    * @param {Object} messageId
    */
    async onSelectMultipleOrder(messageIds) {
        try {
            const onSelectOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onSelectResponse = await this.onSelectOrder(messageId);
                        return { ...onSelectResponse };
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onSelectOrderResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default SelectOrderService;
