import { protocolQuote } from "../../utils/protocolApis/index.js";

class BppQuoteService {

    /**
    * bpp quote order
    * @param {Object} context 
    * @param {Object} cart 
    * @returns 
    */

    async quote(context, cart = {}) {
        try {
            const provider = cart?.items?.[0]?.provider || {};

            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: cart.items.map(cartItem => {
                            return {
                                id: cartItem?.id?.toString(),
                                quantity: cartItem?.quantity,
                                price: cartItem?.product?.price
                            }
                        }) || [],
                        provider: {
                            id: provider?.id,
                            locations: provider.locations.map(location => {
                                return { id: location };
                            })
                        },
                        fulfillments: [{
                            type: "Delivery",
                            end: {
                                location: {
                                    gps: "12.974002, 77.613458",
                                    address: {
                                        area_code: "560001"
                                    }
                                }
                            }
                        }]
                    }
                }
            };

            const response = await protocolQuote(selectRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppQuoteService;
