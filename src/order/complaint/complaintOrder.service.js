
import  ComplaintSchemaModel from '../db/complaints.js';


class ComplaintOrderService {

    /**
    * cancel order
    * @param {Object} orderRequest
    */
    async raiseComplaint(orderRequest) {
        try {

           console.log("orderRequest-------------->",orderRequest);

   let complaintSchemaModel = new ComplaintSchemaModel(orderRequest);

           complaintSchemaModel.save();
            //const orderDetails = await getOrderById(orderRequest.message.order.id);
            return orderRequest;
        }
        catch (err) {

            console.log("erroe------->")
            throw err;
        }
    }

}

export default ComplaintOrderService;
