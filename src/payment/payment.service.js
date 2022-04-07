import { confirmOrder, getBillingAddress, getDeliveryAddress, getOrderDetails } from "../utils/ondcApis/index.js";

class PaymentService 
{
    /**
     * confirm the order status
     * @param {String} orderId 
     * @param {Object} paymentDetails 
     * @param {Object} user 
     */
    async processOrder(orderId, paymentDetails, user = {}) 
    {
        try
        {
            let orderDetails = {};
            let billingAddress = await getBillingAddress(user);
            let deliveryAddress = await getDeliveryAddress(user);
            let order = await getOrderDetails(orderId, user);

            orderDetails = {
                context:{
                    transaction_id: orderId
                },
                message: {
                    items: order,
                    billing_info: {...billingAddress},
                    delivery_info: {...deliveryAddress},
                    payment : {
                        paid_amount: paymentDetails.amount,
                        status: paymentDetails.status,
                        transaction_id: orderId

                    }
                }
            }

            await confirmOrder(orderDetails, user);
        } 
        catch (err) 
        {
            throw err;
        }
    }


}

export default PaymentService;
