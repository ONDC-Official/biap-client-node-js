import { bppInit } from "../../utils/bppApis/index.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppInitService {
    /**
    * bpp init order
    * @param {Object} context
    * @param {String} bppUri
    * @param {Object} order
    */
    async init(context, bppUri, order = {}) {
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
                                name: order.billing_info.name
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
                                    address : {
                                        ...order.delivery_info.location.address,
                                        name: order.delivery_info.name
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
                        },
                    }
                }
            }

            bppUri = getBaseUri(bppUri);
            const response = await bppInit(bppUri, initRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppInitService;
