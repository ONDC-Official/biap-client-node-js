import HttpRequest from "../HttpRequest.js";
import { REGISTRY_SERVICE, REGISTRY_SERVICE_API_URLS } from "./routes.js";

/**
 * lookup bpp by Id
 * @param {Object} subscriberDetails 
 *  
 */
const lookupBppById = async ({subscriber_id, type, domain="nic2004:52110", city="std:080", country="IND"}) => {

    const apiCall = new HttpRequest(
        REGISTRY_SERVICE.url,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        {subscriber_id, type, domain, city, country}
    );

    let result = await apiCall.send();

    return result.data;
};

export { lookupBppById };
