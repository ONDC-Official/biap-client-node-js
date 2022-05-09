import { lookupBppById, lookupGateways } from "../utils/registryApis/index.js";
import { SUBSCRIBER_TYPE } from "../utils/constants.js";
import { onSearch } from "../utils/protocolApis/index.js";

import ContextFactory from "../factories/ContextFactory.js";
import BppSearchService from "./bppSearch.service.js";
import Gateway from "./gateway.service.js";

const bppSearchService = new BppSearchService();
const gateway = new Gateway();

class SearchService {

    /**
     * 
     * @param {Object} context 
     */
    isBppFilterSpecified(context = {}) {
        return typeof context.bpp_id !== "undefined";
    }

    /**
    * search
    * @param {Object} searchRequest
    */
    async search(searchRequest = {}) {
        try {
            const { context: requestContext = {}, message = {} } = searchRequest;
            const { criteria = {} } = message;

            const contextFactory = new ContextFactory();
            const protocolContext = contextFactory.create({
                transactionId: requestContext?.transaction_id,
                bppId: requestContext?.bpp_id
            });

            if(this.isBppFilterSpecified(protocolContext)) {
                const subscriberDetails = await lookupBppById({
                    type: SUBSCRIBER_TYPE.BPP,
                    subscriber_id: protocolContext.bpp_id
                });

                return await bppSearchService.search(
                    subscriberDetails?.[0]?.subscriber_url,
                    protocolContext,
                    criteria
                );
            }
            
            const subscriberDetails = await lookupGateways();
            if(subscriberDetails && subscriberDetails.length) {
                return gateway.search(subscriberDetails[0], protocolContext, criteria);
            }
            
            return null; 
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * transform search results
     * @param {Array} searchResults 
     */
    transform(searchResults) {
        let results = [];
        searchResults.forEach(result => {
            if(result?.message?.catalog && 
                result?.message?.catalog?.["bpp/providers"] &&
                result?.context?.bpp_id
                ) {
                results.push({
                    bpp_descriptor: {
                        ...result?.message?.catalog?.["bpp/descriptor"]
                    },
                    bpp_providers: [
                        ...result?.message?.catalog?.["bpp/providers"]
                    ],
                    bpp_id: result?.context?.bpp_id
                });
            }
        });

        return results;
    }

    /**
    * on search
    * @param {Object} messageId
    */
    async onSearch(messageId) {
        try {            
            const protocolSearchResponse = await onSearch(messageId);
            const transformedResponse = this.transform(protocolSearchResponse);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                messageId: messageId
            });

            return {
                context,
                message: {
                    catalogs: [ ...transformedResponse ],
                }
            };
        }
        catch (err) {
            throw err;
        }
    }
}

export default SearchService;
