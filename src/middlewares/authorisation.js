import { Authorisation } from '../lib/authorisation/index.js';
import logger from '../lib/logger/index.js'; // Assuming you have a logger utility for structured logging

/**
 * Middleware to authorize user access to a specific resource based on their roles.
 *
 * @param {Object} options - Options for the middleware, including the resource and allowed roles.
 * @returns {Function} Express middleware function.
 */
const authorisation = (options) => (req, res, next) => {
    const httpRequestMethod = req.method.toUpperCase(); // Get the HTTP request method
    const authorisationInstance = new Authorisation(req.user, httpRequestMethod, options.resource, options.roles);

    logger.info(`Checking authorisation for user: ${req.user.decodedToken.uid} on resource: ${options.resource}`); // Log the authorization check

    // If user is allowed to access the given resource, proceed; otherwise, forbid access
    authorisationInstance.isAllowed()
        .then(permission => {
            req.permission = permission; // Attach permission info to the request object
            logger.info(`User ${req.user.decodedToken.uid} is authorized to access resource: ${options.resource}`); // Log successful authorization
            next(); // Proceed to the next middleware
        })
        .catch(() => {
            logger.warn(`User ${req.user.decodedToken.uid} is not authorized to access resource: ${options.resource}`); // Log authorization failure
            res.status(403).send(); // Forbidden
        });
};

export default authorisation;
