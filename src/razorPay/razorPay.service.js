// import BadRequestParameterError from '../lib/errors/bad-request-parameter.error.js';
import {uuid} from 'uuidv4';
import Transaction from './db/transaction.js';
import Order from '../order/v1/db/order.js';
import {pad} from '../utils/stringHelper.js';
import Razorpay from 'razorpay';
import {RAZORPAY_STATUS} from '../utils/constants.js';
import crypto from 'crypto';
import BadRequestParameterError from '../lib/errors/bad-request-parameter.error.js';
import ConfirmOrderService from "../order/v2/confirm/confirmOrder.service.js";
import Refund from "./db/refund.js";
const confirmOrderService = new ConfirmOrderService();
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
            

            const numberValue = Number(data.amount);

            // Multiply by 100 to remove decimal point and make it an integer
            const razorpayAmount = Math.round(numberValue * 100);

            let options = {
                amount: razorpayAmount,
                currency: 'INR',
                receipt: humanReadableID
            };
            console.log('[Payment] option......................',options);

            let orderDetail = await instance.orders.create(options);

            const transaction = {
                amount: data.amount,
                status: RAZORPAY_STATUS.IN_PROGRESS,
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

                        const data = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
                        data.update(JSON.stringify(responseData));

                        const digest = data.digest('hex');

                        console.log("digest---->",digest)
                        console.log("signature---->",signature)
                        if (digest === signature)
                        {

                            console.log('request is legit');
                            order.status = 'TXN_SUCCESS';
                            await order.save();
                            return order;

                        }
                        else
                        {
                            throw new BadRequestParameterError('Invalid Signature');
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
                throw new BadRequestParameterError('Invalid Signature');
            }
            
            return responseData;
        } 
        catch (err) 
        {
            throw err;
        }
       
    }

    async verifyPaymentDetails(signature,responseData,confirmdata)
    {

        try
        {

            if(responseData.razorpay_order_id)
            {
                let instance = new Razorpay({
                    key_id:process.env.RAZORPAY_KEY_ID,
                    key_secret:process.env.RAZORPAY_KEY_SECRET
                });
                console.log('responseData......................',responseData);
                let order=await Transaction.findOne({orderId:responseData.razorpay_order_id});
                let previousTransaction = order;

                if(order){

                    const data = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
                    data.update(responseData.razorpay_order_id + "|" + responseData.razorpay_payment_id);

                    const digest = data.digest('hex');

                    if (digest === signature)
                    {
                       let orderDetails = await instance.orders.fetch(responseData.razorpay_order_id)
                       let paymentDetails = await instance.payments.fetch(responseData.razorpay_payment_id)
                        console.log('Razorpay request is legit-----order-->',orderDetails);
                        console.log('Razorpay request is legit------payment->',paymentDetails);
                       if(orderDetails.status==='paid'){
                           order.status = RAZORPAY_STATUS.COMPLETED;
                       }else{
                           order.status = RAZORPAY_STATUS.FAILED;
                       }
                        await order.save();
                        order.payment= paymentDetails
                        await Transaction.updateOne({orderId:responseData.razorpay_order_id},order);
                        return await confirmOrderService.confirmMultipleOrder(confirmdata,responseData)
                    }
                    else
                    {
                        throw new BadRequestParameterError('Invalid Signature');
                    }

                    //TODO: if txn type changes from pending success and make confirm request

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

    async refundAmount(txnId,amount)
    {

        try
        {

            let order=await Transaction.findOne({transactionId:txnId});

            if(order)
            {
                let instance = new Razorpay({
                    key_id:process.env.RAZORPAY_KEY_ID,
                    key_secret:process.env.RAZORPAY_KEY_SECRET
                });

                if(order){

                       let paymentDetails = await instance.payments.fetch(order.payment.id)

                       let refund = new Refund()
                        console.log({paymentDetails})
                    console.log("refund generation ----amount--->",amount)
                    if(paymentDetails){
                        console.log("refund generation ------->",paymentDetails)
                       let refundStatus =  await instance.payments.refund(order.payment.id,{
                            "amount":  `${amount*100*-1}`,
                            "speed": "normal",
                            "notes": {
                                "notes_key_1": "refund",
                            },
                            "receipt": refund._id
                        })

                        console.log({refundStatus})
                        refund.amount = amount;
                        refund.orderId = order.orderId;
                        refund.paymentId = order.paymentId;
                        refund.status = 'refunded';
                        await refund.save();
                    }

                }
            }
        }
        catch (err)
        {
            console.log("refund error ---",err)
            throw err;
        }

    }

  
}

export default RazorPayService;

// webhooks
