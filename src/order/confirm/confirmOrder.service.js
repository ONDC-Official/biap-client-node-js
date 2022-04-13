import { lookupBppById } from "../../utils/registryApis/index.js";
import BppConfirmService from "./bppConfirm.service.js";

const bppConfirmService = new BppConfirmService();

class ConfirmOrderService 
{
    /**
    * confirm order
    * @param {Object} orderRequest
    */
    async confirmOrder(context, order) 
    {
        try
        {
            if(!(order?.items?.length)) {
                throw new Error("Empty order received, no op. Order: {}");
            }
            //TODO add checks
            
            const subcriberDetails = await lookupBppById({type: "BPP", subscriber_id: order?.items[0]?.bpp_id});            

            return bppConfirmService.confirm(context, subcriberDetails?.[0]?.subscriber_url, order);
        } 
        catch (err) 
        {
            throw err;
        }
    }

    /**
    * on confirm order
    * @param {Object} messageId
    */
    async onConfirmOrder(messageId) {
        try {
            let orderStatus = await onOrderConfirm(messageId);

            if (!(orderStatus && orderStatus.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({ messageId: messageId });

                return [{
                    context,
                    error: {
                        message: "No data found"
                    }
                }];
            }
            else {
                return orderStatus;
            }

        }
        catch (err) {
            throw err;
        }
    }
    */
            throw err;
        }
    }
}

export default ConfirmOrderService;
