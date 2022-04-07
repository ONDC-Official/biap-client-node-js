import FetchRequest from "./FetchRequest.js";

/**
 * Retrieve the order object associated with the order_id from juspay
 * @param {String} orderId 
 * @returns 
 */
const getJuspayOrderStatus = async (orderId) => {
    let apiCall = new FetchRequest(
        process.env.JUSPAY_BASE_URL,
        "/orders/" + orderId,
        "GET",
        {},
        { 
            "Accept": 'application/json',
            "x-merchantid": process.env.JUSPAY_MERCHANT_ID,
            "Authorization": 'Basic ' + Buffer.from(process.env.JUSPAY_API_KEY).toString('base64')
        }
    );

    let paymentDetails = {};

    await apiCall.send()
    .then(response => {
        if(response.status === "error" || response.error)
            throw response;
        else
            paymentDetails =  response;
    })
    .catch(err => {
        throw err;
    });

    return paymentDetails;
}

export { getJuspayOrderStatus };