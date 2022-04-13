import { v4 as uuidv4 } from 'uuid';

class ContextFactory {

    constructor(arg = {}) {
        //TODO environment variable setup
        const { domain="nic2004:52110", city="std:080", country="IND", bapId= "box.beckn.org", bapUrl="http://13.235.14.111:9002/protocol/v1" } = arg || {};
        
        this.domain = domain;
        this.city = city;
        this.country = country;
        this.bapId = bapId;
        this.bapUrl = bapUrl;
        this.timestamp = new Date()
    };

    create(contextObject = {}) {
        const {transactionId = uuidv4(), messageId = uuidv4(), action = "search", bppId=null } = contextObject || {};
        
        return {
            domain : this.domain,
            country: this.country,
            city : this.city,
            action : action,
            coreVersion : "0.9.1", //TODO protocol version
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
