import { bppInit } from "../../utils/bppApis/index.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppInitService {
    /**
    * bpp init order
    * @param {Object} orderRequest
    */
    async init(context, bppUri, order) {
        try {
            let provider = order?.items?.[0]?.provider || {};
            
            const initRequest = {
                context: context,
                message: {
                    order: {
                        provider: { 
                            id: provider.id, 
                            locations: provider.locations 
                        },
                        items: order?.items.map(item => {
                            return {
                                id: item.id,
                                quantity: item.quantity
                            };
                        }) || [],
                        billing: order.billing_info,
                        fulfillment: {
                            end: {
                                contact: {
                                    email: order.delivery_info.phone,
                                    phone: order.delivery_info.email
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
                        addOns: [],
                        offers: [],
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
