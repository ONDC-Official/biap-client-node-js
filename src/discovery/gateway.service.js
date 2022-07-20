import { bppSearch } from "../utils/bppApis/index.js";
import { getBaseUri } from "../utils/urlHelper.js";

class Gateway {
    
    /**
     * 
     * @param {String} bppUri 
     * @param {Object} context 
     * @param {Object} criteria 
     * @returns 
     */
    async search(gateway, context = {}, criteria = {}) {
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
            
            let baseUrl = getBaseUri(gateway?.network_participant?.[0]?.subscriber_url);
            
            const response = await bppSearch(baseUrl, searchRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default Gateway;
