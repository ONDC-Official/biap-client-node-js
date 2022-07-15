import { v4 as uuidv4 } from 'uuid';

import { bppInit } from "../../utils/bppApis/index.js";
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
                        id: uuidv4(),
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
                        fulfillment: {
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
                            customer: {
                                person: {
                                    name: order.delivery_info.name
                                }
                            },
                            provider_id: provider.id
                        }
                    }
                }
            };

            bppUri = getBaseUri(bppUri);

            
            const response = await bppInit(bppUri, initRequest);

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
