import { protocolSupport } from "../../utils/protocolApis/index.js";

class BppSupportService {
    
    /**
     * support
     * @param {Object} context 
     * @param {String} refId 
     * @returns 
     */
    async support(context = {}, refId) {
        try {

            const supportRequest = {
                context: context,
                message: {
                    ref_id: refId
                }
            }
                        
            const response = await protocolSupport(supportRequest);
            
            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppSupportService;
