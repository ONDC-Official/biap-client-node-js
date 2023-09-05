import { protocolSelect } from "../../../utils/protocolApis/index.js";

class BppSelectService {

    /**
    * bpp select order
    * @param {Object} context 
    * @param {Object} order 
    * @returns 
    */
    async select(context, order = {}) {
        try {
            const { cart = {}, fulfillments = [] } = order || {};

            const provider = cart?.items?.[0]?.provider || {};

            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: cart.items.map(cartItem => {
                            return {
                                id: cartItem?.local_id?.toString(),
                                quantity: cartItem?.quantity,
                                location_id: provider.locations[0].local_id?.toString()
                            }
                        }) || [],
                        provider: {
                            id: provider?.local_id,
                            locations: provider.locations.map(location => {
                                return { id: location.local_id };
                            })
                        },
                        fulfillments: fulfillments && fulfillments.length ? 
                            [...fulfillments] : 
                            []
                    }
                }
            };

            const response = await protocolSelect(selectRequest);

            return { context: context, message: response.message };
        }
        catch (err) {

            err.response.data.selectRequest =order

            throw err;
        }
    }
}

export default BppSelectService;
