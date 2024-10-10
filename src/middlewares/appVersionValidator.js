import logger from '../lib/logger/index.js'; // Assuming you have a logger utility for structured logging

/**
 * Middleware to validate the app version against the minimum allowed version.
 *
 * @param {Object} options - Options for the middleware (currently unused).
 * @returns {Function} Express middleware function.
 */
const appVersionValidator = (options) => (req, res, next) => {
    const appVersion = req.get('appVersion'); // Retrieve the app version from the request
    logger.info(`Received appVersion: ${appVersion}`); // Log the received appVersion

    // Check if appVersion is provided
    if (appVersion) {
        const systemVersion = process.env.MIN_ALLOWED_APP_VERSION.split('.');
        const versionParts = appVersion.split('.');
        let version = 0;
        let system = 0;
        let multiplier = 100;
        let systemMultiplier = 100;

        // Calculate the app version number
        for (let i = 0; i < versionParts.length; i++) {
            version += versionParts[i] * multiplier;
            multiplier /= 10; // Decrease multiplier for next decimal place
        }

        // Calculate the minimum allowed version number
        for (let i = 0; i < systemVersion.length; i++) {
            system += systemVersion[i] * systemMultiplier;
            systemMultiplier /= 10; // Decrease multiplier for next decimal place
        }

        // Compare versions and proceed accordingly
        if (system <= version) {
            logger.info(`App version ${appVersion} is allowed. Proceeding to next middleware.`);
            next();
        } else {
            logger.warn(`App version ${appVersion} is not allowed. Responding with status 426.`);
            res.status(426).send(); // Upgrade required
        }
    } else {
        logger.warn('No appVersion provided. Proceeding to next middleware.');
        next(); // No app version provided; proceed
    }
};

export default appVersionValidator;
