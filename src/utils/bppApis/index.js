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

    let result = await apiCall.send();
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

export { bppCancel, bppConfirm };
