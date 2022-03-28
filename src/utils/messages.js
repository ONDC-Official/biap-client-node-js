import moment from 'moment';

const MESSAGES = {
    NOTIFICAION_NOT_FOUND: 'Notification does not exist',
    ORDER_NOT_EXIST:'Order not exist',
    PAYMENT_FAILED :'Refund Payment Failed'
};

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    };
}

export default { MESSAGES, formatMessage };