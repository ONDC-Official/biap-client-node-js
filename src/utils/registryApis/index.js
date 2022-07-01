import { SUBSCRIBER_TYPE } from "../constants.js";
import HttpRequest from "../HttpRequest.js";
import { REGISTRY_SERVICE_API_URLS } from "./routes.js";

/**
 * lookup bpp by Id
 * @param {Object} subscriberDetails 
 *  
 */
const lookupBppById = async ({
    subscriber_id, 
    type, 
    domain = process.env.DOMAIN, 
    city = process.env.CITY, 
    country = process.env.COUNTRY
}) => {
    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        {subscriber_id, type, domain, city, country}
    );

    let result = await apiCall.send();

    return result.data;
};

/**
 * lookup gateways
 * @param {Object} subscriberDetails 
 *  
 */
const lookupGateways = async () => {

    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        {
            type: SUBSCRIBER_TYPE.BG,
            domain: process.env.DOMAIN, 
            city: process.env.CITY, 
            country: process.env.COUNTRY
        }
    );

    let result = await apiCall.send();

    return result.data;
};

export { lookupBppById, lookupGateways };
