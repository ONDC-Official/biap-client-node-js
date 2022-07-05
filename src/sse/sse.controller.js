import BadRequestParameterError from '../lib/errors/bad-request-parameter.error.js';
import { addSSEConnection } from '../utils/sse.js';

import SseProtocol from './sseProtocol.service.js';
import ConfigureSse from "./configureSse.service.js";

const sseProtocolService = new SseProtocol();

class SseController {

    /**
    * on event 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    async onEvent(req, res, next) {

        try {
            const { query = {} } = req;
            const { messageId } = query;

            if (messageId && messageId.length) {
                const configureSse = new ConfigureSse(req, res, messageId);
                const initSSE = configureSse.initialize();

                addSSEConnection(messageId, initSSE);

            }

        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on cancel 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onCancel(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;

        sseProtocolService.onCancel(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on confirm 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onConfirm(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;
        
        sseProtocolService.onConfirm(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on init 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onInit(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;

        sseProtocolService.onInit(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on search 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onSearch(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;

        sseProtocolService.onSearch(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on quote 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onQuote(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;

        sseProtocolService.onQuote(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on status 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onStatus(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;

        sseProtocolService.onStatus(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on support 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onSupport(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;

        sseProtocolService.onSupport(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on track 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onTrack(req, res, next) {
        const { body: response, query = {} } = req;
        const { messageId } = query;
        
        sseProtocolService.onTrack(response, messageId).then(result => {
            res.json(result);
        }).catch((err) => {
            next(err);
        });
    }

}

export default SseController;
