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
    async signPayload(req, res, next) 
    {
        const data = req.body;

        try{
            const signedPayload = await juspayService.signPayload(data);
            return res.json({ signedPayload: signedPayload });
        }
        catch(err) {
            next(err);
        }

    }

}

export default PaymentController;
