import { protocolInit } from "../../utils/protocolApis/index.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppInitService {
    /**
    * bpp init order
    * @param {Object} context
    * @param {String} bppUri
    * @param {Object} order
    * @param {String} parentOrderId
    */
    async init(context, bppUri, order = {}, parentOrderId) {
        try {
            const provider = order?.items?.[0]?.provider || {};

            const initRequest = {
                context: context,
                message: {
                    order: {
                        provider: {
                            id: provider.id,
                            locations: provider.locations.map(location => {
                                return { id: location };
                            })
                        },
                        items: order?.items.map(item => {
                            return {
                                id: item?.id?.toString(),
                                quantity: item.quantity
                            };
                        }) || [],
                        add_ons: [],
                        offers: [],
                        billing: {
                            ...order.billing_info,
                            address: {
                                ...order.billing_info.address,
                                name: order.billing_info.name,
                                area_code: order?.billing_info?.address?.areaCode
                            }
                        },
                        fulfillments: [{
                            end: {
                                contact: {
                                    email: order.delivery_info.email,
                                    phone: order.delivery_info.phone
                                },
                                location: {
                                    ...order.delivery_info.location,
                                    gps: "12.974002, 77.613458",
                                    address: {
                                        ...order.delivery_info.location.address,
                                        name: order.delivery_info.name,
                                        area_code: order?.delivery_info?.location?.address?.areaCode
                                    }
                                },
                            },
                            type: "Delivery",
                            customer: {
                                person: {
                                    name: order.delivery_info.name
                                }
                            },
                            provider_id: provider.id
                        }],
                        payment: {
                            type: "ON-ORDER",
                            collected_by: "BAP",
                            "@ondc/org/buyer_app_finder_fee_type": "Percent",
                            "@ondc/org/buyer_app_finder_fee_amount": 0.0,
                            "@ondc/org/ondc-withholding_amount": 0.0,
                            "@ondc/org/ondc-return_window": 0.0,
                            "@ondc/org/ondc-settlement_basis": "Collection",
                            "@ondc/org/ondc-settlement_window": "PT2D"
                        }
                    }
                }
            };

            
            bppUri = getBaseUri(bppUri);

            const response = await protocolInit(bppUri, initRequest);

            return {
                context: {
                    ...context,
                    parent_order_id: parentOrderId,
                    provider_id: provider.id
                },
                message: response.message
            };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppInitService;
