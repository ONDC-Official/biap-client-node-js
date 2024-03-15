import BadRequestParameterError from '../lib/errors/bad-request-parameter.error.js';
import {uuid} from 'uuidv4';
import Transaction from './db/transaction.js';
import Order from '../order/v1/db/order.js';
import {pad} from '../utils/stringHelper.js';
import Razorpay from 'razorpay';
import {RAZORPAY_STATUS} from '../utils/constants.js';
import crypto from 'crypto';

class RazorPayService
{

    /**
     * create payment
     * @param {Object} data
     * @param {Integer} data.amount
     * @param {String} data.receiptNo
     */
    async createPayment(transactionId,data,user,currentUserAccessToken)
    {
        try 
        {

            console.log('[Payment] data......................',data);

            let uuid1 = uuid();
            const intent = await Order .findOne({transactionId:transactionId})

            if (!intent)
                throw new BadRequestParameterError();

            let paymentDetail;
            let instance = new Razorpay({
                key_id:process.env.RAZORPAY_KEY_ID,
                key_secret:process.env.RAZORPAY_KEY_SECRET
            });

            // integer The transaction amount, 
            // expressed in the currency subunit, 
            // such as paise (in case of INR). For example, 
            // for an actual amount of ₹299.35, 
            // the value of this field should be 29935.
            //ref : https://razorpay.com/docs/payments/payment-gateway/server-integration/nodejs/

            // console.log('[payment] orderDetail.........',orderDetail);

            let lastTransaction = await Transaction.find({}).sort({createdAt:-1}).limit(1)
            let humanReadableID = '';

            if(lastTransaction ) {
                const lastHumanReadableID = lastTransaction.humanReadableID;

                if (lastHumanReadableID) {
                    const lastTransactionNumber = lastHumanReadableID.split('-');

                    //get humanReadable id
                    humanReadableID = `transactionId_${parseInt(lastTransactionNumber.slice(-1)) + 1}`;
                }else{

                    humanReadableID = `transactionId_${pad(1, 4)}`;
                }
            }else{
                humanReadableID = `transactionId_${pad(1, 4)}`;
            }

            let options = {
                amount: parseInt(data.amount) * 100,
                currency: 'INR',
                receipt: humanReadableID
            };
            console.log('[Payment] option......................',options);

            let orderDetail = await instance.orders.create(options);

            const transaction = {
                amount: data.amount,
                status: RAZORPAY_STATUS.COMPLETED,
                type: 'ON-ORDER',
                transactionId: transactionId,
                orderId:orderDetail.id,
                humanReadableID:humanReadableID,
            };
            const intentTransaction = new Transaction(transaction);
            await intentTransaction.save();

            const resp = {
                orderDetail,
                intentTransaction,
                transactionIdx: intentTransaction._id,
            };

            return resp;
        } 
        catch (err) 
        {

            throw err;
        }
     
    }



    /**
    * verify payment
    * @param {Object} data
    * @param {Integer} data.amount
    * @param {String} data.receiptNo
    */
    async verifyPayment(signature,responseData) 
    {
          
        try 
        {

            if(responseData.payload.payment.entity.order_id)
            {

                console.log('responseData......................',responseData);
                let order=await Transaction.findOne({order_id:responseData.payload.payment.entity.order_id});
                let previousTransaction = order;

                if(order){

                    console.log('order details-------------------------->',order);

                    if(responseData.event === 'payment.captured' || responseData.event === 'order.paid' || responseData.event === 'payment.authorized')
                    {

                        const data = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_ID);
                        data.update(JSON.stringify(responseData));

                        const digest = data.digest('hex');

                        if (digest === signature)
                        {
                            console.log('request is legit');
                            order.status = 'TXN_SUCCESS';
                            await order.save();
                            return order;
                        }
                        else
                        {
                            return 'Invalid Signature';
                        }
                    }

                    if(responseData.event === 'refund.created')
                    {
                        order.status = 'TXN_REVERSED';
                        await order.save();
                        return order;
                    }

                    if(responseData.event === 'payment.failed')
                    {
                        order.status = 'TXN_FAILURE';
                        await order.save();
                        return order;

                    }

                    //TODO: if txn type changes from pending success and make confirm request

                    // const response = {
                    //     change: {
                    //         type: CHANGE_TYPES.STATUS_UPDATE,
                    //         update: order,
                    //         transaction: previousTransaction,
                    //         newTransaction: order,
                    //         transactionIdx: order._id,
                    //     },
                    // };

                }
            }
            else{

                console.log('response data..........................\n',responseData);
                console.log('response data json..........................n',JSON.stringify(responseData));

            }
            
            return responseData;
        } 
        catch (err) 
        {
            throw err;
        }
       
    }

  
}

export default RazorPayService;

// webhooks
