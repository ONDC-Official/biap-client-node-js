/**
 * 
 * @param {String} transactionId 
 * @param {String} providerId 
 * @returns 
 */
export const getBAPOrderId = (transactionId, providerId) => {
    try {
        console.log(transactionId, providerId);
        if(transactionId && providerId)
            return transactionId + "_" + providerId;
        else
            throw new Error("Please provide transaction id and provider id"); 
    }
    catch(err) {
        throw err;
    }
}