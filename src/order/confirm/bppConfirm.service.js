import { bppConfirm } from "../../utils/bppApis/index.js";
import { PAYMENT_TYPES, PROTOCOL_PAYMENT } from "../../utils/constants.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppConfirmService {
    /**
    * bpp confirm order
    * @param {Object} orderRequest
    */
    async confirm(context, bppUri, order) {
        try {
            let provider = order?.items?.[0]?.provider || {};

            const confirmRequest = {
                context: context,
                message: {
                    order: {
                        billing: order.billing_info,
                        items: order?.items.map(item => {
                            return {
                                id: item.id,
                                quantity: item.quantity
                            };
                        }) || [],
                        provider: {
                            id: provider.id,
                            locations: provider.locations
                        },
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
                        payment: {
                            params: {
                                amount: order?.payment?.paid_amount?.toString(),
                                currency: "INR",
                            },
                            status: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ? PROTOCOL_PAYMENT.PAID : PROTOCOL_PAYMENT["NOT-PAID"],
                            type: order?.payment?.type
                        }
                    }
                }
            }

            bppUri = getBaseUri(bppUri);

            const response = await bppConfirm(bppUri, confirmRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppConfirmService;
