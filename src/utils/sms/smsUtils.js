import axios from "axios";

const smsURL = 'https://iqsms.airtel.in/gateway/airtel-iq-sms-utility/sendSms'

let templates = {
    ORDER_DELIVERED: {templateId : '1007444196217565511',
    messageContext : "It's time to celebrate. Your order from {{var0}} is {{var1}} - ONDC"},
    ORDER_PLACED:{templateId : '1007674601408183398',
    messageContext : 'Hello there, Your order from {{var0}} is Confirmed - ONDC'}
}
async function sendAirtelSingleSms(toMobile, smsBody, templateId, isOtp = false) {

    try {

            try {

                let sentence = templates[templateId].messageContext
                for (let [index, val] of smsBody.entries()) {
                    sentence = sentence.replace(`{{var${index}}}`, val)
                }
                const authData = `${process.env.DLT_USERNAME}:${process.env.DLT_PASSWORD}`;
                const authDataEnc = Buffer.from(authData).toString('base64');
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${authDataEnc}`,
                };
                const reqData = {
                    customerId: process.env.DLT_CUSTOMER_ID,
                    destinationAddress: [toMobile],
                    sourceAddress: process.env.DLT_SOURCE,
                    messageType: process.env.DLT_MESSAGE_TYPE,
                    entityId: process.env.DLT_ENTITY_ID,
                    message:sentence,
                    dltTemplateId: templates[templateId].templateId,
                    otp: isOtp,
                };

                const res = await axios.post(smsURL, reqData, { headers })
                    .then((response) => response.data)
                    .catch((error) => error);
                return res;
            } catch (err) {
                throw new Error(err);
            }

    } catch (err) {
        console.log(err);
        return err;
    }
};


export default sendAirtelSingleSms


