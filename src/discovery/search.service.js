import _ from "lodash";

import { onSearch } from "../utils/protocolApis/index.js";

import ContextFactory from "../factories/ContextFactory.js";
import BppSearchService from "./bppSearch.service.js";
import {CITY_CODE} from "../utils/cityCode.js"
// import logger from "../lib/logger";
const bppSearchService = new BppSearchService();

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

            // logger.info(`[SearchService][search] Search product`, {params: searchRequest});

            const { context: requestContext = {}, message = {} } = searchRequest;
            const { criteria = {}, payment } = message;


            // console.log("City---------------->",city);
            const contextFactory = new ContextFactory();
            const protocolContext = contextFactory.create({
                transactionId: requestContext?.transaction_id,
                bppId: requestContext?.bpp_id,
                city:requestContext.city,
                state:requestContext.state
            });

            return await bppSearchService.search(
                protocolContext,
                { criteria, payment }
            );
            
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

            if (!_.isEmpty(result?.["provider_details"]))
                providerList.set(
                    result?.["provider_details"]?.id,
                    result?.["provider_details"]?.descriptor?.name
                );

            if (!_.isEmpty(result?.["category_details"]))
                categoryList.set(
                    result?.["category_details"]?.id,
                    result?.["category_details"]?.descriptor?.name
                );

            if (!_.isEmpty(result?.["fulfillment_details"]))
                fulfillmentList.set(
                    result?.["fulfillment_details"]?.id,
                    result?.["fulfillment_details"]
                );

            const value = parseFloat(result?.price?.value);
            if (maxPrice < value)
                maxPrice = value;

            if (minPrice > value)
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

            console.log("protocolSearchResponse--------------------->",protocolSearchResponse.data[0].context)
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                messageId: messageId
            });

            return {
                context,
                message: {
                    catalogs: [...searchResult],
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
