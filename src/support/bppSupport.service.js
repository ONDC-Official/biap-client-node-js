import { protocolSupport } from "../utils/protocolApis/index.js";
import { getBaseUri } from "../utils/urlHelper.js";

class BppSupportService {
    
    /**
     * support
     * @param {String} bppUri 
     * @param {Object} context 
     * @param {String} refId 
     * @returns 
     */
    async support(bppUri, context = {}, refId) {
        try {

            const supportRequest = {
                context: context,
                message: {
                    refId: refId
                }
            }
            bppUri = getBaseUri(bppUri);
            
            const response = await protocolSupport(bppUri, supportRequest);
            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppSupportService;
