import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';
import { addSSEConnection } from '../../utils/sse.js';
import SseProtocol from './sseProtocolService.js';
import ConfigureSse from "./configureSseService.js";
import logger from '../../lib/logger/index.js'; // Import your logger

const sseProtocolService = new SseProtocol();

class SseController {
    /**
     * Handles the event when a connection is established.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onEvent(req, res, next) {
        try {
            const { query = {} } = req;
            const { messageId } = query;

            logger.info('[SseController] onEvent called', { messageId });

            if (messageId && messageId.length) {
                const configureSse = new ConfigureSse(req, res, messageId);
                const initSSE = configureSse.initialize();

                addSSEConnection(messageId, initSSE);
                logger.info('[SseController] SSE connection added', { messageId });
            }

            // res.json({});
        } catch (err) {
            logger.error(`[SseController] Error in onEvent: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles cancellation events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onCancel(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onCancel called', { response });

        try {
            const result = await sseProtocolService.onCancel(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onCancel: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles confirmation events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onConfirm(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onConfirm called', { response });

        try {
            const result = await sseProtocolService.onConfirm(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onConfirm: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles initialization events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onInit(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onInit called', { response });

        try {
            const result = await sseProtocolService.onInit(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onInit: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles search events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onSearch(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onSearch called', { response });

        try {
            const result = await sseProtocolService.onSearch(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onSearch: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles quote events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onQuote(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onQuote called', { response });

        try {
            const result = await sseProtocolService.onQuote(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onQuote: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles status events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onStatus(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onStatus called', { response });

        try {
            const result = await sseProtocolService.onStatus(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onStatus: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles support events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onSupport(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onSupport called', { response });

        try {
            const result = await sseProtocolService.onSupport(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onSupport: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles tracking events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onTrack(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onTrack called', { response });

        try {
            const result = await sseProtocolService.onTrack(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onTrack: ${err.message}`);
            next(err);
        }
    }

    /**
     * Handles update events.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>}
     */
    async onUpdate(req, res, next) {
        const { body: response } = req;

        logger.info('[SseController] onUpdate called', { response });

        try {
            const result = await sseProtocolService.onUpdate(response);
            res.json(result);
        } catch (err) {
            logger.error(`[SseController] Error in onUpdate: ${err.message}`);
            next(err);
        }
    }
}

export default SseController;
