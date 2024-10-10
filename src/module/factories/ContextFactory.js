import { v4 as uuidv4 } from 'uuid';
import { PROTOCOL_CONTEXT, PROTOCOL_VERSION } from '../../utils/constants.js';
import { CITY_CODE } from "../../utils/cityCode.js";
import MappedCity from "../../utils/mappedCityCode.js";
import logger from '../../lib/logger/index.js'; // Assuming you have a logger utility

class ContextFactory {
    constructor(arg = {}) {
        let {
            domain,
            country = process.env.COUNTRY,
            bapId = process.env.BAP_ID,
            bapUrl = process.env.BAP_URL,
            city,
            state,
        } = arg || {};

        this.domain = domain;
        this.country = country;
        this.bapId = bapId;
        this.bapUrl = bapUrl;
        this.timestamp = new Date();
    }

    /**
     * Get the city code based on city and state.
     * @param {string} city - The city name.
     * @param {string} state - The state name.
     * @param {string} [cityCode] - Optional city code.
     * @returns {string} - The city code.
     */
    getCity(city, state, cityCode) {
        // Map state and city to city code
        if (cityCode) {
            return cityCode;
        } else {
            cityCode = process.env.CITY;
            let cityMapping = CITY_CODE.find(x => {
                if (x.City === city && x.State === state) {
                    return x;
                }
            });

            if (cityMapping) {
                if (cityMapping.Code) {
                    cityCode = cityMapping.Code;
                }
            }
            return cityCode;
        }
    }

    /**
     * Get the city based on the provided pin code.
     * @param {string} pincode - The pincode for the location.
     * @param {string} city - The city name.
     * @returns {string} - The standard city code or the original city name.
     */
    getCityByPinCode(pincode, city) {
        try {
            logger.info("City and Pincode:", { city, pincode });
            // Map city and pincode
            if (pincode) {
                let cityData = MappedCity(parseInt(pincode));
                logger.info("Mapped City Data:", cityData);
                if (cityData.length > 0) {
                    return `std:${cityData[0]?.STDCode}`;
                } else {
                    return 'std:080'; // Default STD code if no mapping found
                }
            } else {
                return city; // Return original city if no pincode provided
            }
        } catch (e) {
            logger.error("Error in getCityByPinCode:", e);
            return city; // Fallback to original city in case of error
        }
    }

    /**
     * Generate a transaction ID.
     * @param {string} [transactionId] - Optional transaction ID.
     * @returns {string} - The provided or newly generated transaction ID.
     */
    getTransactionId(transactionId) {
        return transactionId || uuidv4(); // Generate a new transaction ID if none is provided
    }

    /**
     * Create a context object with the provided parameters.
     * @param {Object} [contextObject={}] - Context object parameters.
     * @param {string} [contextObject.transactionId] - Optional transaction ID.
     * @param {string} [contextObject.messageId] - Optional message ID.
     * @param {string} [contextObject.action] - Action type.
     * @param {string} [contextObject.bppId] - Optional BPP ID.
     * @param {string} [contextObject.city] - Optional city.
     * @param {string} [contextObject.state] - Optional state.
     * @param {string} [contextObject.cityCode] - Optional city code.
     * @param {string} [contextObject.bpp_uri] - Optional BPP URI.
     * @param {string} [contextObject.pincode] - Optional pincode.
     * @param {string} [contextObject.domain] - Optional domain.
     * @returns {Object} - The created context object.
     */
    create(contextObject = {}) {
        const {
            transactionId,
            messageId = uuidv4(),
            action = PROTOCOL_CONTEXT.SEARCH,
            bppId,
            city,
            state,
            cityCode,
            bpp_uri,
            pincode,
            domain
        } = contextObject || {};

        return {
            domain: domain,
            country: this.country,
            city: this.getCityByPinCode(pincode, city),
            action: action,
            core_version: PROTOCOL_VERSION.v_1_2_0,
            bap_id: this.bapId,
            bap_uri: this.bapUrl,
            bpp_uri: bpp_uri,
            transaction_id: this.getTransactionId(transactionId),
            message_id: messageId,
            timestamp: this.timestamp,
            ...(bppId && { bpp_id: bppId }),
            ttl: "PT30S"
        };
    }
}

export default ContextFactory;
