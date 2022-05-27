import _isEmpty from "lodash/isEmpty.js";

import QuoteService from './quoteOrder.service.js';
import { poll } from '../../utils/apiUtil.js';

const quoteService = new QuoteService();

class CscQuoteService {

    /**
     * 
     * @param {Object} request 
     * @returns 
     */
    async quoteOrder(request) {
        try {

            const quoteBppResponse = await quoteService.quoteOrder(request);

            const quoteResult = await poll(
                async () => {
                    return await quoteService.onQuoteOrder(quoteBppResponse?.context?.message_id);
                },
                (result, count) => {
                    return !_isEmpty(result) && result?.message || count === 3;
                },
                3,
                2000
            );

            return { ...quoteResult };
        }
        catch (err) {
            throw err;
        }
    }
}

export default CscQuoteService;
