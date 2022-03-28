import JuspayService from './juspay.service.js';

const juspayService = new JuspayService();

class PaymentController 
{

    /**
    * sign payload
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    async signedPayload(req, res, next) 
    {
        const data = req.body;

        try{
            const signedPayload = await juspayService.signedPayload(data);
            return res.json({ signedPayload: signedPayload });
        }
        catch(err) {
            console.log(err);
            throw err;
        }

    }

}

export default PaymentController;
