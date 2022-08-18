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
                        ...(
                            criteria?.search_string && {
                                item: {
                                    descriptor: {
                                        name: criteria.search_string
                                    }
                                }
                            }
                        ),
                        ...((criteria?.provider_id || criteria?.category_id || criteria?.provider_name) && {
                            provider: {
                                ...(criteria?.provider_id && {
                                    id: criteria?.provider_id
                                }),
                                ...(criteria?.category_id && {
                                    category_id: criteria.category_id
                                }),
                                ...(criteria?.provider_name && {
                                    descriptor: {
                                        name: criteria?.provider_name
                                    }
                                })
                            }
                        }),
                        ...((criteria?.pickup_location || criteria?.delivery_location) && {
                            fulfillment: {
                                ...(criteria?.pickup_location && {
                                    start: {
                                        location: {
                                            gps: criteria?.pickup_location
                                        }
                                    }
                                }),
                                ...(criteria?.delivery_location && {
                                    end: {
                                        location: {
                                            gps: criteria?.delivery_location
                                        }
                                    }
                                })
                            }
                        }),
                        ...(
                            (criteria?.category_id || criteria?.category_name) && {
                                category: {
                                    ...(criteria?.category_id && {
                                        id: criteria?.category_id
                                    }),
                                    ...(criteria?.category_name && {
                                        descriptor: {
                                            name: criteria?.category_name
                                        }
                                    }
                                    )
                                }
                            }
                        ),
                        payment: {
                            "@ondc/org/buyer_app_finder_fee_type": payment?.buyer_app_finder_fee_type || process.env.BAP_FINDER_FEE_TYPE,
                            "@ondc/org/buyer_app_finder_fee_amount": payment?.buyer_app_finder_fee_amount || parseFloat(process.env.BAP_FINDER_FEE_AMOUNT),
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
