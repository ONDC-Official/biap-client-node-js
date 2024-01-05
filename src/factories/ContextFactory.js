import { v4 as uuidv4 } from 'uuid';
import { PROTOCOL_CONTEXT, PROTOCOL_VERSION } from '../utils/constants.js';
import {CITY_CODE} from "../utils/cityCode.js";


class ContextFactory {

    constructor(arg = {}) {
        let {
            domain,
           //TODO: map city to city code. eg. Haydrabad
            country = process.env.COUNTRY,
            bapId = process.env.BAP_ID,
            bapUrl = process.env.BAP_URL,
            city,
            state
        } = arg || {};

        this.domain = domain;
        this.country = country;
        this.bapId = bapId;
        this.bapUrl = bapUrl;
        this.timestamp = new Date()
    };


    getCity(city,state,cityCode){

        //map state and city to city code

        if(cityCode){
            return cityCode
        }else{
            cityCode = process.env.CITY
            let cityMapping = CITY_CODE.find(x => {
                if( x.City === city && x.State === state){
                    return x
                }
            })

            if(cityMapping){
                if(cityMapping.Code){
                    cityCode = cityMapping.Code
                }
            }
            return cityCode
        }


    }

    getTransactionId(transactionId){
        if(transactionId){
            return transactionId
        }else{
            return uuidv4()
        }
    }

    create(contextObject = {}) {
        const {
            transactionId, //FIXME: if ! found in args then create new
            messageId = uuidv4(),
            action = PROTOCOL_CONTEXT.SEARCH,
            bppId,
            city,state,cityCode,bpp_uri,
            domain

        } = contextObject || {};

        console.log("domain------>",domain);
        return {
            domain: domain,
            country: this.country,
            city: this.getCity(city,state,cityCode) ,
            action: action,
            core_version:PROTOCOL_VERSION.v_1_2_0 ,
            bap_id: this.bapId,
            bap_uri: this.bapUrl,
            bpp_uri: bpp_uri,
            transaction_id: this.getTransactionId(transactionId),
            message_id: messageId,
            timestamp: this.timestamp,
            ...(bppId && { bpp_id: bppId }),
            ttl:"PT30S"
        };

    }
}

export default ContextFactory;
