import ComplaintOrderService from './complaintOrder.service.js';
import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';

const complaintService= new ComplaintOrderService();

class ComplaintOrderController {
    /**
    * cancel order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    async raiseComplaint(req, res, next) {
        const {body: complaint} = req;

        // console.log("orderStatus-------------------->",orders)

                try {

                    console.log("complaint orders--------------->",complaint);
                    let savedObject = await complaintService.raiseComplaint(complaint);

                    console.log("savedObject---->",savedObject);
                    res.json(savedObject);
                } catch (err) {

                    console.log("update orders---------err------>",err);
                    next(err)
                    // throw err;
                }

        // return onUpdateOrderResponse;
    }

}

export default ComplaintOrderController;
