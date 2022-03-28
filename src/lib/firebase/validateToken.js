import admin from 'firebase-admin';

/**
 * 
 * @param {String} token 
 * @returns {String} decodedToken
 */
const validateToken = async (token) => {
    let decodedToken;
    try
    {
        decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    }
    catch(e)
    {
        // Token is invalid.
        return null;
    }
}

export default validateToken;