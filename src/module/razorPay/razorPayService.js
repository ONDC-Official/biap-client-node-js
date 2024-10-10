import { uuid } from 'uuidv4';
import Transaction from './db/transaction.js';
import Order from '../order/v1/db/order.js';
import { pad } from '../../utils/stringHelper.js';
import Razorpay from 'razorpay';
import { RAZORPAY_STATUS } from '../../utils/constants.js';
import crypto from 'crypto';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';
import ConfirmOrderService from "../order/v2/confirm/confirmOrderService.js";
import Refund from "./db/refund.js";
import logger from '../../lib/logger/index.js'; // Import your logger

const confirmOrderService = new ConfirmOrderService();

class RazorPayService {
    /**
     * Create a payment
     * @param {string} transactionId - The ID of the transaction
     * @param {Object} data - Payment details
     * @param {number} data.amount - Amount to be paid
     * @param {string} data.receiptNo - Receipt number for the payment
     * @param {Object} user - User making the payment
     * @param {string} currentUserAccessToken - Access token for the current user
     * @returns {Promise<Object>} - Payment response details
     */
    async createPayment(transactionId, data, user, currentUserAccessToken) {
        try {
            logger.info(`[RazorPayService] Creating payment for transaction ID: ${transactionId}`, data);

            let uuid1 = uuid();
            const intent = await Order.findOne({ transactionId: transactionId });

            if (!intent) {
                throw new BadRequestParameterError();
            }

            let paymentDetail;
            let instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });

            let lastTransaction = await Transaction.find({}).sort({ createdAt: -1 }).limit(1);
            let humanReadableID = '';

            if (lastTransaction) {
                const lastHumanReadableID = lastTransaction.humanReadableID;

                if (lastHumanReadableID) {
                    const lastTransactionNumber = lastHumanReadableID.split('-');
                    humanReadableID = `transactionId_${parseInt(lastTransactionNumber.slice(-1)) + 1}`;
                } else {
                    humanReadableID = `transactionId_${pad(1, 4)}`;
                }
            } else {
                humanReadableID = `transactionId_${pad(1, 4)}`;
            }

            const numberValue = Number(data.amount);
            const razorpayAmount = Math.round(numberValue * 100); // Convert amount to subunit

            let options = {
                amount: razorpayAmount,
                currency: 'INR',
                receipt: humanReadableID
            };

            let orderDetail = await instance.orders.create(options);

            const transaction = {
                amount: data.amount,
                status: RAZORPAY_STATUS.IN_PROGRESS,
                type: 'ON-ORDER',
                transactionId: transactionId,
                orderId: orderDetail.id,
                humanReadableID: humanReadableID,
            };

            const intentTransaction = new Transaction(transaction);
            await intentTransaction.save();

            const resp = {
                orderDetail,
                intentTransaction,
                transactionIdx: intentTransaction._id,
            };

            logger.info(`[RazorPayService] Payment created successfully: ${JSON.stringify(resp)}`);
            return resp;

        } catch (err) {
            logger.error(`[RazorPayService] Error creating payment: ${err.message}`);
            throw err;
        }
    }

    /**
     * Verify payment details
     * @param {string} signature - Signature from Razorpay
     * @param {Object} responseData - Response data from Razorpay
     * @returns {Promise<Object>} - Verified payment status
     */
    async verifyPayment(signature, responseData) {
        try {
            if (responseData.payload.payment.entity.order_id) {
                logger.info('[RazorPayService] Verifying payment', responseData);
                let order = await Transaction.findOne({ order_id: responseData.payload.payment.entity.order_id });

                if (order) {
                    if (responseData.event === 'payment.captured' || responseData.event === 'order.paid' || responseData.event === 'payment.authorized') {
                        const data = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
                        data.update(JSON.stringify(responseData));
                        const digest = data.digest('hex');

                        if (digest === signature) {
                            logger.info('Razorpay request is legit, updating order status to TXN_SUCCESS');
                            order.status = 'TXN_SUCCESS';
                            await order.save();
                            return order;
                        } else {
                            throw new BadRequestParameterError('Invalid Signature');
                        }
                    }

                    if (responseData.event === 'refund.created') {
                        order.status = 'TXN_REVERSED';
                        await order.save();
                        return order;
                    }

                    if (responseData.event === 'payment.failed') {
                        order.status = 'TXN_FAILURE';
                        await order.save();
                        return order;
                    }
                }
            } else {
                logger.warn('[RazorPayService] Invalid response data', responseData);
                throw new BadRequestParameterError('Invalid Signature');
            }

            return responseData;
        } catch (err) {
            logger.error(`[RazorPayService] Error verifying payment: ${err.message}`);
            throw err;
        }
    }

    /**
     * Verify payment details with confirmation data
     * @param {string} signature - Signature from Razorpay
     * @param {Object} responseData - Response data from Razorpay
     * @param {Object} confirmdata - Confirmation data for the order
     * @returns {Promise<Object>} - Verified payment status with confirmation
     */
    async verifyPaymentDetails(signature, responseData, confirmdata) {
        try {
            if (responseData.razorpay_order_id) {
                logger.info('[RazorPayService] Verifying payment details', responseData);
                let instance = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });
                let order = await Transaction.findOne({ orderId: responseData.razorpay_order_id });

                if (order) {
                    const data = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
                    data.update(responseData.razorpay_order_id + "|" + responseData.razorpay_payment_id);
                    const digest = data.digest('hex');

                    if (digest === signature) {
                        let orderDetails = await instance.orders.fetch(responseData.razorpay_order_id);
                        let paymentDetails = await instance.payments.fetch(responseData.razorpay_payment_id);

                        logger.info('Razorpay request is legit, updating order status');
                        if (orderDetails.status === 'paid') {
                            order.status = RAZORPAY_STATUS.COMPLETED;
                        } else {
                            order.status = RAZORPAY_STATUS.FAILED;
                        }
                        await order.save();
                        order.payment = paymentDetails;
                        await Transaction.updateOne({ orderId: responseData.razorpay_order_id }, order);
                        return await confirmOrderService.confirmMultipleOrder(confirmdata, responseData);
                    } else {
                        throw new BadRequestParameterError('Invalid Signature');
                    }
                }
            } else {
                logger.warn('[RazorPayService] Invalid response data', responseData);
            }

            return responseData;
        } catch (err) {
            logger.error(`[RazorPayService] Error verifying payment details: ${err.message}`);
            throw err;
        }
    }

    /**
     * Refund an amount for a given transaction
     * @param {string} txnId - The transaction ID for which the refund is requested
     * @param {number} amount - The amount to be refunded
     * @returns {Promise<void>}
     */
    async refundAmount(txnId, amount) {
        try {
            logger.info(`[RazorPayService] Processing refund for transaction ID: ${txnId}, amount: ${amount}`);

            let order = await Transaction.findOne({ transactionId: txnId });

            if (order) {
                let instance = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });

                let paymentDetails = await instance.payments.fetch(order.payment.id);
                let refund = new Refund();

                if (paymentDetails) {
                    logger.info('Initiating refund', paymentDetails);
                    let refundStatus = await instance.payments.refund(order.payment.id, {
                        "amount": `${amount * 100 * -1}`, // Refund amount in subunit
                        "speed": "normal",
                        "notes": {
                            "notes_key_1": "refund",
                        },
                        "receipt": refund._id
                    });

                    logger.info('Refund status:', refundStatus);
                    refund.amount = amount;
                    refund.orderId = order.orderId;
                    refund.paymentId = order.paymentId;
                    refund.status = 'refunded';
                    await refund.save();
                }
            }
        } catch (err) {
            logger.error(`[RazorPayService] Error processing refund: ${err.message}`);
            throw err;
        }
    }
}

export default RazorPayService;
