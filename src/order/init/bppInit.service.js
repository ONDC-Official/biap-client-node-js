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

            console.log("context---------------->",context);
            order.delivery_info.location.address.area_code = order.delivery_info.location.address.areaCode
            delete order.delivery_info.location.address.areaCode

            order.billing_info.address.area_code = order.billing_info.address.areaCode
            delete order.billing_info.address.areaCode

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
                                quantity: item.quantity,
                                fulfillment_id:item?.fulfillment_id
                            };
                        }) || [],
                        billing: {
                            ...order.billing_info,
                            address: {
                                ...order.billing_info.address,
                                name: order.billing_info.name,
                                area_code: order?.billing_info?.address?.area_code
                            }
                        },
                        fulfillments: [{
                            id: order.fulfillments[0].id,
                            type: order.fulfillments[0].type,
                            provider_id: order.fulfillments[0].provider_id,
                            tracking: order.fulfillments[0].tracking,
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
                                        area_code: order?.delivery_info?.location?.address?.area_code
                                    }
                                },
                            }
                        }],
                        tags:
                            [
                                {
                                    code:"bap_terms_fee",
                                    list:
                                        [
                                            {
                                                code:"finder_fee_type",
                                                value:order?.payment?.buyer_app_finder_fee_type || process.env.BAP_FINDER_FEE_TYPE
                                            },
                                            {
                                                code:"finder_fee_amount",
                                                value: order?.payment?.buyer_app_finder_fee_amount || process.env.BAP_FINDER_FEE_AMOUNT
                                            }
                                        ]
                                }
                            ]
                    }

                }
            };

            const response = await protocolInit(initRequest);

            // return initRequest

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
            err.response.data.initRequest =order

            throw err;
        }
    }
}

export default BppInitService;
