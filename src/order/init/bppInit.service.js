import { bppInit } from "../../utils/bppApis/index.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppInitService {
    /**
    * bpp init order
    * @param {Object} orderRequest
    */
    async init(context, bppUri, order) {
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
                                id: item.id,
                                quantity: item.quantity
                            };
                        }) || [],
                        add_ons: [],
                        offers: [],
                        billing: order.billing_info,
                        fulfillment: {
                            end: {
                                contact: {
                                    email: order.delivery_info.email,
                                    phone: order.delivery_info.phone
                                },
                                location: order.delivery_info.location,
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
