import RazorPayService from './razorPay.service.js';
//import {Payment} from "../models";


const razorPayService = new RazorPayService();

class RazorPayController 
{

    /**
     * create payment
     * @param {*} req    HTTP request object
     * @param {*} res    HTTP response object
     * @param {*} next   Callback argument to the middleware function
     * @return {callback}
     */
    createPayment(req, res, next) {
        const {orderId: orderId} = req.params;
        const currentUser = req.user;
        const data = req.body;

        const currentUserAccessToken = res.get('currentUserAccessToken');
        razorPayService.createPayment(orderId,data,currentUser,currentUserAccessToken).then(user => {
            res.json({data: user});
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
    verifyPayment(req, res, next) 
    {
      
        const confirmdata = req.body.confirmRequest;
        const razorPaydata = req.body.razorPayRequest;
        const signature = razorPaydata.razorpay_signature
        razorPayService.verifyPaymentDetails(signature,razorPaydata,confirmdata).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    async rzr_webhook(req, res){
        try {

            const data = req.body;
            const signature = req.headers['x-razorpay-signature'];

            console.log("req.headers",req.headers)
            razorPayService.verifyPayment(signature,data).then(user => {
                res.json({data: user});
            }).catch((err) => {
                throw err;
            });

        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

    async keys(req, res){
        try {
                res.json({keyId:process.env.RAZORPAY_KEY_ID});
        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

}

export default RazorPayController;