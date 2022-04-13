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
    * @param {Object} messageIds
    */
    async onConfirmOrder(messageIds) 
    {
        try
        {
            console.log(messageIds);
        } 
        catch (err) 
        {
            throw err;
        }
    }
}

export default ConfirmOrderService;
