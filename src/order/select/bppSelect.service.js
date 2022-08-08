import { bppSelect } from "../../utils/bppApis/index.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppSelectService {

    /**
    * bpp select order
    * @param {Object} context 
    * @param {String} bppUri 
    * @param {Object} cart 
    * @returns 
    */

    async select(context, bppUri, order = {}) {
        try {
            const { cart = {}, fulfillments = [] } = order || {};

            const provider = cart?.items?.[0]?.provider || {};

            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: cart.items.map(cartItem => {
                            return {
                                id: cartItem?.id?.toString(),
                                quantity: cartItem?.quantity
                            }
                        }) || [],
                        provider: {
                            id: provider?.id,
                            locations: provider.locations.map(location => {
                                return { id: location };
                            })
                        },
                        fulfillments: fulfillments && fulfillments.length ? 
                            [...fulfillments] : 
                            []
                    }
                }
            };
            
            bppUri = getBaseUri(bppUri);

            const response = await bppSelect(bppUri, selectRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppSelectService;
