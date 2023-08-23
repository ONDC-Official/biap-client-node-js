import { protocolSearchItems,protocolGetItems,protocolGetAttributes,protocolGetAttributesValues } from "../../utils/protocolApis/index.js";

class BppSearchService {

    /**
     * 
     * @param {Object} context 
     * @param {Object} req 
     * @returns 
     */
    async search(searchRequest) {
        try {

            const response = await protocolSearchItems(searchRequest);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

    /**
     *
     * @param {Object} context
     * @param {Object} req
     * @returns
     */
    async getItem(searchRequest,itemId) {
        try {

            const response = await protocolGetItems(searchRequest,itemId);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

    async getAttributes(searchRequest) {
        try {

            const response = await protocolGetAttributes(searchRequest);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }
    async getAttributesValues(searchRequest) {
        try {

            const response = await protocolGetAttributesValues(searchRequest);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppSearchService;
