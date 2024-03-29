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
    protocolProvideDetails, protocolGetLocationDetails,
    protocolGetItemDetails
} from "../../utils/protocolApis/index.js";

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
    async getProvideDetails(searchRequest) {
        try {

            const response = await protocolProvideDetails(searchRequest);

            console.log({response});

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

    async getLocationDetails(searchRequest) {
        try {

            const response = await protocolGetLocationDetails(searchRequest);

            console.log({response});

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

    async getItemDetails(searchRequest) {
        try {

            const response = await protocolGetItemDetails(searchRequest);

            console.log({response});

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

    async getProvider(searchRequest,brandId) {
        try {

            const response = await protocolGetProvider(searchRequest,brandId);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

    async getLocation(searchRequest,id) {
        try {

            const response = await protocolGetLocation(searchRequest,id);

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
    async getItems(searchRequest) {
        try {

            const response = await protocolGetItemList(searchRequest);

            console.log({response})
            return { response };
        }
        catch (err) {
            throw err;
        }
    }
    async getLocations(searchRequest) {
        try {

            const response = await protocolGetLocations(searchRequest);

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

    async getProviders(searchRequest) {
        try {

            const response = await protocolGetProviders(searchRequest);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

    async getCustomMenus(searchRequest) {
        try {

            const response = await protocolGetCustomMenus(searchRequest);

            return { response };
        }
        catch (err) {
            throw err;
        }
    }

}

export default BppSearchService;
