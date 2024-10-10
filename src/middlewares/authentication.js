import { UnauthenticatedError } from '../lib/errors/index.js';
import validateToken from '../lib/firebase/validateToken.js';
import MESSAGES from '../utils/messages.js';
import logger from '../lib/logger/index.js'; // Assuming you have a logger utility for structured logging

/**
 * Middleware to authenticate the user based on the provided authorization token.
 *
 * @param {Object} options - Options for the middleware (currently unused).
 * @returns {Function} Express middleware function.
 */
const authentication = (options) => (req, res, next) => {
    const authHeader = req.headers.authorization; // Get the authorization header

    if (authHeader) {
        const idToken = authHeader.split(" ")[1]; // Extract the token from the header

        logger.info(`Received authorization token: ${idToken}`); // Log the received token

        validateToken(idToken)
            .then(decodedToken => {
                if (decodedToken) {
                    req.user = { decodedToken: decodedToken, token: idToken }; // Store the decoded token and original token in the request
                    logger.info(`Token validated successfully for user: ${decodedToken.uid}`); // Log successful validation
                    next(); // Proceed to the next middleware
                } else {
                    logger.warn(`Invalid token provided: ${idToken}`); // Log invalid token warning
                    next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
                }
            })
            .catch(err => {
                logger.error(`Error validating token: ${err.message}`); // Log error during token validation
                next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
            });
    } else {
        logger.warn('No authorization header provided.'); // Log absence of authorization header
        next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
    }
};

export default authentication;
