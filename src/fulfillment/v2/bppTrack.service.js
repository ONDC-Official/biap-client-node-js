import { protocolTrack } from "../../utils/protocolApis/index.js";

class BppTrackService {
    
    /**
     * track order
     * @param {Object} context 
     * @param {Object} trackRequest 
     * @returns 
     */
    async track(context = {}, request = {}) {
        try {

            const trackRequest = {
                context: context,
                message: {
                    ...request.message
                }
            }
                        
            const response = await protocolTrack(trackRequest);
            
            return { context: context, message: response.message };
        }
        catch (err) {
            console.error('Error', err);
            throw err;
        }
    }
}

export default BppTrackService;
