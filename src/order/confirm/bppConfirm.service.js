import { bppConfirm } from "../../utils/bppApis/index.js";
import { PAYMENT_TYPES, PROTOCOL_PAYMENT } from "../../utils/constants.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppConfirmService {
    
    /**
     * bpp confirm order
     * @param {String} bppUri 
     * @param {Object} confirmRequest 
     * @returns 
     */
    async confirm(bppUri, confirmRequest = {}) {
        try {
            
            bppUri = getBaseUri(bppUri);
            const response = await bppConfirm(bppUri, confirmRequest);

            return { context: confirmRequest.context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * bpp confirm order
     * @param {Object} context 
     * @param {String} bppUri 
     * @param {Object} order 
     * @param {Object} storedOrder 
     * @returns 
     */
    async confirmV1(context, bppUri, order = {}) {
        try {

            const provider = order?.items?.[0]?.provider || {};

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
                        addOns: [],
                        offers: [],
                        payment: {
                            params: {
                                amount: order?.payment?.paid_amount?.toString(),
                                currency: "INR",
                            },
                            status: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ? 
                                PROTOCOL_PAYMENT.PAID : 
                                PROTOCOL_PAYMENT["NOT-PAID"],
                            type: order?.payment?.type
                        }
                    }
                }
            }
            
            return await this.confirm(bppUri, confirmRequest);
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * bpp confirm order v2
     * @param {Object} context 
     * @param {String} bppUri 
     * @param {Object} order 
     * @param {Object} storedOrder 
     * @returns 
     */
    async confirmV2(context, bppUri, order = {}, storedOrder = {}) {
        try {

            const confirmRequest = {
                context: context,
                message: {
                    order: {
                        billing: storedOrder?.billing,
                        items: storedOrder?.items|| [],
                        provider: storedOrder?.provider,
                        fulfillment: storedOrder?.fulfillment,
                        addOns: [],
                        offers: [],
                        payment: {
                            params: {
                                amount: order?.payment?.paid_amount?.toString(),
                                currency: "INR",
                            },
                            status: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ? 
                                PROTOCOL_PAYMENT.PAID : 
                                PROTOCOL_PAYMENT["NOT-PAID"],
                            type: order?.payment?.type
                        }
                    }
                }
            }
            
            return await this.confirm(bppUri, confirmRequest);
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppConfirmService;
