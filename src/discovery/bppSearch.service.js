import { bppSearch } from "../utils/bppApis/index.js";
import { getBaseUri } from "../utils/urlHelper.js";

class BppSearchService {
    
    /**
     * 
     * @param {String} bppUri 
     * @param {Object} context 
     * @param {Object} criteria 
     * @returns 
     */
    async search(bppUri, context = {}, criteria = {}) {
        try {

            const searchRequest = {
                context: context,
                message: {
                    intent: {
                        item: {
                            descriptor: {
                                name: criteria.search_string
                            }
                        },
                        provider: {
                            id: criteria.provider_id,
                            category_id: criteria.category_id,
                            descriptor: {
                                name: criteria.provider_name
                            }
                        },
                        fulfillment: criteria.delivery_location ? {
                            start: {
                                location: {
                                    gps: criteria.pickup_location
                                }
                            },
                            end: {
                                location: {
                                    gps: criteria.delivery_location
                                }
                            }
                        }: null,
                        category: {
                            id: criteria.category_id,
                            descriptor: {
                                name: criteria.category_name
                            }
                        }
                    }
                }
            }
            
            bppUri = getBaseUri(bppUri);
            const response = await bppSearch(bppUri, searchRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppSearchService;
