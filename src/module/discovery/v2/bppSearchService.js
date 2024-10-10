import {
    protocolSearchItems,
    protocolGetItems,
    protocolGetAttributes,
    protocolGetAttributesValues,
    protocolGetProviders,
    protocolGetCustomMenus,
    protocolGetProvider,
    protocolGetLocation,
    protocolGetItemList,
    protocolGetLocations,
    protocolProvideDetails,
    protocolGetLocationDetails,
    protocolGetItemDetails
} from "../../../utils/protocolApis/index.js";

class BppSearchService {

    /**
     * Search for items based on the provided request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the search API
     */
    async search(searchRequest) {
        try {
            const response = await protocolSearchItems(searchRequest);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get provider details based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the provider details API
     */
    async getProvideDetails(searchRequest) {
        try {
            const response = await protocolProvideDetails(searchRequest);
            console.log({ response });
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get location details based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the location details API
     */
    async getLocationDetails(searchRequest) {
        try {
            const response = await protocolGetLocationDetails(searchRequest);
            console.log({ response });
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get item details based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the item details API
     */
    async getItemDetails(searchRequest) {
        try {
            const response = await protocolGetItemDetails(searchRequest);
            console.log({ response });
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get a specific item based on the search request and item ID
     * @param {Object} searchRequest
     * @param {String} itemId
     * @returns {Promise<Object>} Response from the item API
     */
    async getItem(searchRequest, itemId) {
        try {
            const response = await protocolGetItems(searchRequest, itemId);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get provider based on the search request and brand ID
     * @param {Object} searchRequest
     * @param {String} brandId
     * @returns {Promise<Object>} Response from the provider API
     */
    async getProvider(searchRequest, brandId) {
        try {
            const response = await protocolGetProvider(searchRequest, brandId);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get location based on the search request and location ID
     * @param {Object} searchRequest
     * @param {String} id
     * @returns {Promise<Object>} Response from the location API
     */
    async getLocation(searchRequest, id) {
        try {
            const response = await protocolGetLocation(searchRequest, id);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get attributes based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the attributes API
     */
    async getAttributes(searchRequest) {
        try {
            const response = await protocolGetAttributes(searchRequest);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get item list based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the item list API
     */
    async getItems(searchRequest) {
        try {
            const response = await protocolGetItemList(searchRequest);
            console.log({ response });
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get locations based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the locations API
     */
    async getLocations(searchRequest) {
        try {
            const response = await protocolGetLocations(searchRequest);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get attribute values based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the attribute values API
     */
    async getAttributesValues(searchRequest) {
        try {
            const response = await protocolGetAttributesValues(searchRequest);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get providers based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the providers API
     */
    async getProviders(searchRequest) {
        try {
            const response = await protocolGetProviders(searchRequest);
            return { response };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get custom menus based on the search request
     * @param {Object} searchRequest
     * @returns {Promise<Object>} Response from the custom menus API
     */
    async getCustomMenus(searchRequest) {
        try {
            const response = await protocolGetCustomMenus(searchRequest);
            return { response };
        } catch (err) {
            throw err;
        }
    }
}

export default BppSearchService;
