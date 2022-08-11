import { bppSearch } from "../utils/bppApis/index.js";
import { getSubscriberUrl } from "../utils/registryApis/registryUtil.js";
import { getBaseUri } from "../utils/urlHelper.js";

class Gateway {

    /**
     * 
     * @param {String} bppUri 
     * @param {Object} context 
     * @param {Object} req 
     * @returns 
     */
    async search(bppUri, context = {}, req = {}) {
        try {
            const { criteria = {}, payment = {} } = req || {};

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
                        } : null,
                        category: {
                            id: criteria.category_id,
                            descriptor: {
                                name: criteria.category_name
                            }
                        },
                        payment: {
                            "@ondc/org/buyer_app_finder_fee_type": payment?.buyer_app_finder_fee_type || process.env.BAP_FINDER_FEE_TYPE,
                            "@ondc/org/buyer_app_finder_fee_amount": payment?.buyer_app_finder_fee_amount || process.env.BAP_FINDER_FEE_AMOUNT,
                        }
                    }
                }
            }
            let baseUrl = getBaseUri(bppUri);
            
            const response = await bppSearch(baseUrl, searchRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default Gateway;
