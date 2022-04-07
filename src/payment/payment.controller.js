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
        try{
            const data = req.body;
                
            const signedPayload = await juspayService.signPayload(data);
            return res.json({ signedPayload: signedPayload });
        }
        catch(err) {
            next(err);
        }

    }

    /**
    * get order status
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getOrderStatus(req, res, next) {
        const { params, user } = req;
        const { orderId: orderId } = params;     
        
        juspayService.getOrderStatus(orderId, user).then(orderStatus => {
            res.json({data: orderStatus});
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * verify payment
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    async verifyPayment(req, res, next) 
    {
        const data = req.body;

        try{
            await juspayService.verifyPayment(data);
            return res.json({ status: "ok" });
        }
        catch(err) {
            next(err);
        }

    }
}

export default PaymentController;
