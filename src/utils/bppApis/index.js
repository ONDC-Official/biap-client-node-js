import HttpRequest from "../HttpRequest.js";
import BPP_API_URLS from "./routes.js";

/**
 * confirm order
 * @param {Object} orderDetails 
 * @param {Object} user 
 */
const bppConfirm = async (bppUri, order) => {

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.CONFIRM,
        "POST",
        order
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * cancel order
 * @param {Object} orderDetails 
 * @param {Object} user 
 */
const bppCancel = async (bppUri, order) => {

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.CANCEL,
        "POST",
        order
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * initialize order
 * @param {Object} orderDetails 
 * @param {Object} user 
 */
const bppInit = async (bppUri, order) => {

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.INIT,
        "POST",
        order
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * search
 * @param {Object} orderDetails 
 * @param {Object} user 
 */
const bppSearch = async (bppUri, criteria) => {

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.SEARCH,
        "POST",
        criteria
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * track order
 * @param {Object} orderDetails 
 * @param {Object} user 
 */
const bppTrack = async (bppUri, trackRequest) => {

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.TRACK,
        "POST",
        trackRequest
    );

    const result = await apiCall.send();
    return result.data;
};

export { bppCancel, bppConfirm, bppInit, bppSearch, bppTrack };
