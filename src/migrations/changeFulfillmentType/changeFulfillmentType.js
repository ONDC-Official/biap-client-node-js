import OrderMongooseModel from '../../order/v1/db/order.js';

const changeFulfillmentType = async (req, res, next) => {
    try {
        const result = await OrderMongooseModel.updateMany(
            { fulfillment: { $ne: null } },
            [
                { $set: { fulfillments: ["$fulfillment"] } },
                { "$unset": ["fulfillment"] }
            ]
        );

        console.log("migration-------", result);

        res.json({
            message: {
                ack: {
                    status: "ACK"
                }
            }
        });

    }
    catch (err) {
        console.error('Error', err);
        throw err;
    }
}

export default changeFulfillmentType;