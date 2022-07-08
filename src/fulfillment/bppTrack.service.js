import { protocolTrack } from "../utils/protocolApis/index.js";
import { getBaseUri } from "../utils/urlHelper.js";

class BppTrackService {
    
    /**
     * track order
     * @param {String} bppUri 
     * @param {Object} context 
     * @param {Object} trackRequest 
     * @returns 
     */
    async track(bppUri, context = {}, request = {}) {
        try {

            const trackRequest = {
                context: context,
                message: {
                    ...request.message
                }
            }
            bppUri = getBaseUri(bppUri);
            
            const response = await protocolTrack(bppUri, trackRequest);
            
            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppTrackService;
