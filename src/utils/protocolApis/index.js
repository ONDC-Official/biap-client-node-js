import HttpRequest from "../HttpRequest.js";
import PROTOCOL_API_URLS from "./routes.js";

/**
 * on confirm order
 * @param {String} messageId 
 */
const onOrderConfirm = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CONFIRM + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on cancel order
 * @param {String} messageId 
 */
const onOrderCancel = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CANCEL + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on init order
 * @param {String} messageId 
 */
const onOrderInit = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_INIT + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on track order
 * @param {String} messageId 
 */
const onOrderTrack = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_TRACK + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};


/**
 * on support
 * @param {String} messageId 
 */
const onOrderSupport = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SUPPORT + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};


/**
 * on order status
 * @param {String} messageId 
 */
const onOrderStatus = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_STATUS + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

export { onOrderCancel, onOrderConfirm, onOrderInit, onOrderTrack, onOrderSupport, onOrderStatus };
