import { protocolSearch } from "../utils/protocolApis/index.js";

class BppSearchService {

    /**
     * 
     * @param {Object} context 
     * @param {Object} req 
     * @returns 
     */
    async search(context = {}, req = {}) {
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

            const response = await protocolSearch(searchRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppSearchService;
