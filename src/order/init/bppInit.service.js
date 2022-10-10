import { PAYMENT_COLLECTED_BY, PAYMENT_TYPES } from "../../utils/constants.js";
import { protocolInit } from "../../utils/protocolApis/index.js";

class BppInitService {
    /**
    * bpp init order
    * @param {Object} context
    * @param {Object} order
    * @param {String} parentOrderId
    */
    async init(context, order = {}, parentOrderId) {
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
                                    address: {
                                        ...order.delivery_info.location.address,
                                        name: order.delivery_info.name,
                                        area_code: order?.delivery_info?.location?.address?.areaCode
                                    }
                                },
                            },
                            type: order.delivery_info.type,
                            provider_id: provider.id
                        }],
                        payment: {
                            type: order?.payment?.type,
                            collected_by: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ? PAYMENT_COLLECTED_BY.BAP : PAYMENT_COLLECTED_BY.BPP,
                            "@ondc/org/buyer_app_finder_fee_type": order?.payment?.buyer_app_finder_fee_type || process.env.BAP_FINDER_FEE_TYPE,
                            "@ondc/org/buyer_app_finder_fee_amount": order?.payment?.buyer_app_finder_fee_amount || process.env.BAP_FINDER_FEE_AMOUNT,
                            "@ondc/org/ondc-withholding_amount": 0.0,
                            "@ondc/org/ondc-return_window": 0.0,
                            "@ondc/org/ondc-settlement_basis": "Collection",
                            "@ondc/org/ondc-settlement_window": "PT2D"
                        }
                    }
                }
            };

            const response = await protocolInit(initRequest);

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
