import { bppConfirm } from "../../utils/bppApis/index.js";
import { PAYMENT_TYPES, PROTOCOL_PAYMENT } from "../../utils/constants.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppConfirmService {
    
    /**
     * bpp confirm order
     * @param {Object} context 
     * @param {String} bppUri 
     * @param {Object} order 
     * @param {Object} storedOrder 
     * @returns 
     */
    async confirm(context, bppUri, order = {}, storedOrder = {}) {
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
