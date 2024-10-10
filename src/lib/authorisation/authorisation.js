import _ from 'lodash';
import { UnauthorisedError } from "../errors/index.js";
import logger from '../../lib/logger/index.js'; // Assuming you have a logger utility for structured logging

class Authorisation {
    /**
     * Creates an instance of the Authorisation class.
     *
     * @param {*} user - Current logged-in user object.
     * @param {string} httpRequestMethod - HTTP request method (e.g., GET, POST, PUT, DELETE).
     * @param {string} resource - Requested resource (e.g., user, case, etc.).
     * @param {Array} roles - Array of roles to check against the user's roles.
     */
    constructor(user, httpRequestMethod, resource, roles) {
        this.user = user;
        this.roles = roles;
    }

    /**
     * Checks if the user has access to the given protected resource.
     *
     * @returns {Promise<*>} Resolves with the user object if access is granted, rejects with an UnauthorisedError otherwise.
     * @throws {Error} Throws an error if an exception occurs during the check.
     */
    isAllowed() {
        return new Promise((resolve, reject) => {
            try {
                // Check if the user has one of the provided roles
                const hasAccess = this.user.Roles.some(obj => this.roles.includes(obj.name));

                if (hasAccess) {
                    logger.info(`Access granted for user ${this.user.id} to roles: ${this.roles}`); // Log access granted
                    resolve(this.user);
                } else {
                    logger.warn(`Access denied for user ${this.user.id}. Roles: ${this.user.Roles}`); // Log access denied
                    reject(new UnauthorisedError());
                }
            } catch (err) {
                logger.error(`Error in authorisation check for user ${this.user.id}: ${err.message}`); // Log error
                reject(err);
            }
        });
    }
}

export default Authorisation;
