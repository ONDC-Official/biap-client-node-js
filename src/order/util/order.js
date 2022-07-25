/**
 * 
 * @param {String} transactionId 
 * @param {String} providerId 
 * @returns 
 */
export const getBAPOrderId = (transactionId, providerId) => {
    return transactionId + "_" + providerId;
}