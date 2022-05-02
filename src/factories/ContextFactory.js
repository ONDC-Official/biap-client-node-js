import { v4 as uuidv4 } from 'uuid';
import { PROTOCOL_CONTEXT, PROTOCOL_VERSION } from '../utils/constants.js';

class ContextFactory {

    constructor(arg = {}) {
        const { 
            domain = process.env.DOMAIN, 
            city = process.env.CITY, 
            country = process.env.COUNTRY, 
            bapId = process.env.BAP_ID, 
            bapUrl = process.env.BAP_URL 
        } = arg || {};
        
        this.domain = domain;
        this.city = city;
        this.country = country;
        this.bapId = bapId;
        this.bapUrl = bapUrl;
        this.timestamp = new Date()
    };

    create(contextObject = {}) {
        const {
            transactionId = uuidv4(), 
            messageId = uuidv4(), 
            action = PROTOCOL_CONTEXT.SEARCH,
            bppId 
        } = contextObject || {};
                
        return {
            domain : this.domain,
            country: this.country,
            city : this.city,
            action : action,
            core_version : PROTOCOL_VERSION.v_0_9_3,
            bap_id : this.bapId,
            bap_uri : this.bapUrl,
            bpp_id : bppId,
            transaction_id : transactionId,
            message_id : messageId,
            timestamp: this.timestamp
        };

    }
}

export default ContextFactory;
