import fetch from 'node-fetch';

import HttpRequest from "../HttpRequest.js";
import PROTOCOL_API_URLS from "./routes.js";

/**
 * order confirm
 * @param {Object} data 
 * @returns 
 */
const protocolConfirm = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CONFIRM,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on confirm order
 * @param {String} messageId 
 */
const onOrderConfirm = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_confirm',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order cancel
 * @param {Object} data 
 * @returns 
 */
const protocolCancel = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CANCEL,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on cancel order
 * @param {String} messageId 
 */
const onOrderCancel = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_cancel',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * init order
 * @param {Object} data 
 * @returns 
 */
const protocolInit = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.INIT,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on init order
 * @param {String} messageId 
 */
const onOrderInit = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_init',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * search
 * @param {Object} data 
 * @returns 
 */
const protocolSearch = async (data) => {
    
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH,
        "POST",
        {
            ...data
        },
        
    );

    const result = await apiCall.send();

    return result.data;
}

/**
 * search items
 * @param {Object} data
 * @returns
 */
const protocolSearchItems = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH_ITEM,
        "GET",
        {
            ...data
        }
    );

    const result = await apiCall.send();

    return result.data;
}

/**
 * search items
 * @param {Object} data
 * @returns
 */
const protocolGetItems = async (searchRequest,itemId) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH_ITEM +"/"+itemId,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetItemList = async (searchRequest) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH_ITEM,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetAttributes = async (searchRequest) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH_ATTRIBUTE,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetAttributesValues = async (searchRequest) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH_ATTRIBUTE_VALUE,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetCustomMenus = async (searchRequest) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CUSTOM_MENU,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetProviders = async (searchRequest) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.PROVIDERS,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetProvider = async (searchRequest,brandId) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.PROVIDERS+"/"+brandId,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetLocation = async (searchRequest,id) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.LOCATIONS+"/"+id,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

const protocolGetLocations = async (searchRequest) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.LOCATIONS,
        "GET",
        {
            ...searchRequest
        }
    );

    const result = await apiCall.send();

    return result.data;
}

/**
 * on search products
 * @param {Object} query 
 */
const onSearch = async (query) => {

    const queryString = Object.keys(query).map(key => {
        if (typeof key !== "undefined" && typeof query[key] !== "undefined")
            return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
    }).join('&');

    const apiCall = await fetch(
        process.env.PROTOCOL_BASE_URL
        + "/" +
        PROTOCOL_API_URLS.ON_SEARCH + "?" + queryString
    );

    const result = await apiCall.json();
    return result;
};

/**
 * track order
 * @param {Object} data 
 * @returns 
 */
const protocolTrack = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.TRACK,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on track order
 * @param {String} messageId 
 */
const onOrderTrack = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_track',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order support
 * @param {Object} data 
 * @returns 
 */
const protocolSupport = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SUPPORT,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on support
 * @param {String} messageId 
 */
const onOrderSupport = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SUPPORT + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order status
 * @param {Object} data 
 * @returns 
 */
const protocolOrderStatus = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.STATUS,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on order status
 * @param {String} messageId 
 */
const onOrderStatus = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_status',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * on order status
 * @param {String} messageId
 */
const protocolUpdate = async (data) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.UPDATE,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * on order update status
 * @param {String} messageId
 */
const onUpdateStatus = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_update',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * quote order
 * @param {Object} data 
 * @returns 
 */
const protocolSelect = async (data) => {

    console.log("protocolSelect-------------------------",data);
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SELECT,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on quote order
 * @param {String} messageId 
 */
const onOrderSelect = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.RESPONSE,
        "get",
        {requestType:'on_select',messageId:messageId}
    );

    const result = await apiCall.send();
    return result.data;
};

export {
    onOrderCancel,
    onOrderConfirm,
    onOrderInit,
    onSearch,
    onOrderStatus,
    onOrderSupport,
    onOrderTrack,
    onOrderSelect,
    protocolCancel,
    protocolConfirm,
    protocolInit,
    protocolSearch,
    protocolOrderStatus,
    protocolSupport,
    protocolTrack,
    protocolSelect,
    protocolUpdate,
    onUpdateStatus,
    protocolSearchItems,
    protocolGetItems,
    protocolGetAttributes,
    protocolGetAttributesValues,
    protocolGetProviders,
    protocolGetCustomMenus,
    protocolGetProvider,
    protocolGetLocation,
    protocolGetItemList,
    protocolGetLocations
};
