import _ from "lodash";

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

            if(subscriberDetails && subscriberDetails.length)
                return gateway.search(subscriberDetails[0], protocolContext, criteria);
            
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
    transform(searchResults = []) {
        let data = [];
        
        searchResults && searchResults.length && searchResults.forEach(result => {
            let searchObj = { ...result };
            delete searchObj?.["context"];

            data.push({
                ...searchObj
            });
        });

        return data;
    }

    /**
     * return filtering items
     * @param {Array} searchResults 
     */
    getFilter(searchResults = []) {
        let providerList = new Map();
        let categoryList = new Map();
        let fulfillmentList = new Map();
        let minPrice = Infinity; 
        let maxPrice = -Infinity; 

        searchResults && searchResults.length && searchResults.forEach(result => {

            if(!_.isEmpty(result?.["provider_details"]))
                providerList.set(
                    result?.["provider_details"]?.id, 
                    result?.["provider_details"]?.descriptor?.name
                );

            if(!_.isEmpty(result?.["category_details"]))
                categoryList.set(
                    result?.["category_details"]?.id, 
                    result?.["category_details"]?.descriptor?.name
                );

            if(!_.isEmpty(result?.["fulfillment_details"]))
                fulfillmentList.set(
                    result?.["fulfillment_details"]?.id, 
                    result?.["fulfillment_details"]
                );

            const value = parseFloat(result?.price?.value);
            if(maxPrice < value) 
                maxPrice = value;

            if(minPrice > value) 
                minPrice = value;
        });

        return { categoryList, fulfillmentList, minPrice, maxPrice, providerList };
    }

    /**
    * on search
    * @param {Object} queryParams
    */
    async onSearch(queryParams) {
        try {            
            const { messageId } = queryParams;

            const protocolSearchResponse = await onSearch(queryParams);
            const searchResult = this.transform(protocolSearchResponse?.data);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                messageId: messageId
            });

            return {
                context,
                message: {
                    catalogs: [ ...searchResult ],
                    count: protocolSearchResponse?.count
                },
            };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * get filter params
    * @param {String} query
    */
    async getFilterParams(query) {
        try {            
            const protocolSearchResponse = await onSearch(query);

            const { 
                categoryList = {}, 
                fulfillmentList = {}, 
                minPrice, 
                maxPrice, 
                providerList = {}
            } = this.getFilter(protocolSearchResponse?.data);

            return {
                categories: Array.from(categoryList, ([id, name]) => ({ id, name })),
                fulfillment: Array.from(fulfillmentList, ([id, value]) => ({ id, value })),
                minPrice: minPrice,
                maxPrice: maxPrice,
                providers: Array.from(providerList, ([id, name]) => ({ id, name })),
            };
        }
        catch (err) {
            throw err;
        }
    }
}

export default SearchService;
