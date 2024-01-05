import { onOrderSupport } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../utils/constants.js";

import BppSupportService from "./bppSupport.service.js";
import ContextFactory from "../../factories/ContextFactory.js";

const bppSupportService = new BppSupportService();

class SupportService {

    /**
    * support order
    * @param {Object} supportRequest
    */
    async support(supportRequest) {
        try {
            const { context: requestContext, message } = supportRequest || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.SUPPORT,
                transactionId: requestContext?.transaction_id,
                bppId: requestContext?.bpp_id,
                city:requestContext.city,
                state:requestContext.state
            });

            return await bppSupportService.support(
                context,
                message?.ref_id
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * support multiple orders
     * @param {Array} requests 
     */
    async supportMultipleOrder(requests) {

        const supportResponses = await Promise.all(
            requests.map(async request => {
                try {
                    const supportResponse = await this.support(request);
                    return supportResponse;
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return supportResponses;
    }

    /**
    * on support order
    * @param {Object} messageId
    */
    async onSupport(messageId) {
        try {
            const protocolSupportResponse = await onOrderSupport(messageId);
            if(protocolSupportResponse && protocolSupportResponse.length)
                return protocolSupportResponse?.[0];
            else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_SUPPORT
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
            throw err;
        }
    }

    /**
    * on support multiple order
    * @param {Object} messageId
    */
    async onSupportMultipleOrder(messageIds) {
        try {
            const onSupportResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onSupportResponse = await this.onSupport(messageId);
                        return { ...onSupportResponse };
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onSupportResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default SupportService;
