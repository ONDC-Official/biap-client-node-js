import NodeRSA from "node-rsa";
import fs from "fs";
import util from "util";

// import { accessSecretVersion } from "../utils/accessSecretKey.js";
import { getJuspayOrderStatus } from "../utils/juspayApis.js";
import MESSAGES from "../utils/messages.js";
import { NoRecordFoundError } from "../lib/errors/index.js";
import PaymentService from "./payment.service.js";

const readFile = util.promisify(fs.readFile);

const paymentService = new PaymentService();
class JuspayService 
{
    /**
    * sign payload using juspay's private key
    * @param {Object} data
    */
    async signPayload(data) 
    {
        try
        {
            const { payload } = data;     
            let result = null;

            if(payload) {
                // const privateKeyHyperBeta = await accessSecretVersion(process.env.JUSPAY_SECRET_KEY_PATH);
                const privateKeyHyperBeta = await readFile(process.env.JUSPAY_SECRET_KEY_PATH, 'utf-8');
                
                const encryptKey = new NodeRSA(privateKeyHyperBeta, 'pkcs1');
                result = encryptKey.sign(payload,'hex','utf8');
            }
            return result;

        } 
        catch (err) 
        {
            throw err;
        }
    }

    /**
    * get order status
    * @param {Object} data
    */
    async getOrderStatus(orderId, user) 
    {
        try 
        {
            let paymentDetails = await getJuspayOrderStatus(orderId);

            if(!paymentDetails)
                throw new NoRecordFoundError(MESSAGES.ORDER_NOT_EXIST);
            // else if(paymentDetails.status === "CHARGED")
            //     await paymentService.processOrder(orderId, paymentDetails, user);

            return paymentDetails;
        } 
        catch (err) 
        {
            throw err;
        }
    }

    /**
    * verify payment webhook
    * @param {Object} data
    */
    async verifyPayment(data) 
    {
        try
        {
            const { id, date_created, event_name, content = {}} = data;     

            switch (event_name) {
                case "ORDER_SUCCEEDED":
                    // TODO : Process the payment
                    break;
                case "ORDER_FAILED":

                    break;
                case "ORDER_AUTHORIZED":

                    break;
                default:
                    break;
            }
            

        } 
        catch (err) 
        {
            throw err;
        }
    }

}

export default JuspayService;
